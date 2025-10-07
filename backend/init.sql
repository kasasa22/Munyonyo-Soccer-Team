-- Football Management System Database Schema
-- With proper relationships and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (system users - admins, managers, etc.)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'treasurer', 'viewer')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    password_hash VARCHAR(255), -- for authentication
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Players Table (team players)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    annual DECIMAL(10,2) DEFAULT 150000.00,
    monthly DECIMAL(10,2) DEFAULT 10000.00,
    pitch DECIMAL(10,2) DEFAULT 5000.00,
    match_day DECIMAL(10,2), -- optional default amount for match day payments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Match Days Table (optional for organizing expenses)
CREATE TABLE IF NOT EXISTS match_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_date DATE NOT NULL UNIQUE,
    opponent VARCHAR(255),
    venue VARCHAR(255),
    match_type VARCHAR(50) NOT NULL DEFAULT 'friendly' CHECK (match_type IN ('friendly', 'league', 'cup', 'tournament', 'training', 'expense')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    player_name VARCHAR(255) NOT NULL, -- denormalized for easier queries
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('annual', 'monthly', 'pitch', 'matchday')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Expenses Table - ENHANCED with both date and optional match day reference
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Facilities', 'Equipment', 'Food & Drinks', 'Transport', 'Medical', 'Officials')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Direct date field
    match_day_id UUID REFERENCES match_days(id) ON DELETE SET NULL, -- Optional reference to match day
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_player_id ON payments(player_id);
CREATE INDEX IF NOT EXISTS idx_payments_player_name ON payments(player_name);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_match_day_id ON expenses(match_day_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_match_days_date ON match_days(match_date);
CREATE INDEX IF NOT EXISTS idx_match_days_type ON match_days(match_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to sync player name in payments
CREATE OR REPLACE FUNCTION sync_player_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Update player_name when player_id changes
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.player_id != NEW.player_id) THEN
        SELECT name INTO NEW.player_name 
        FROM players 
        WHERE id = NEW.player_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to sync player names
CREATE TRIGGER sync_payment_player_name 
    BEFORE INSERT OR UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION sync_player_name();

-- Create views for easier reporting
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    p.id,
    p.name,
    p.phone,
    p.annual,
    p.monthly,
    p.pitch,
    p.match_day,
    COALESCE(SUM(pay.amount), 0) as total_paid,
    COALESCE(SUM(CASE WHEN pay.payment_type = 'annual' THEN pay.amount END), 0) as annual_paid,
    COALESCE(SUM(CASE WHEN pay.payment_type = 'monthly' THEN pay.amount END), 0) as monthly_paid,
    COALESCE(SUM(CASE WHEN pay.payment_type = 'pitch' THEN pay.amount END), 0) as pitch_paid,
    COALESCE(SUM(CASE WHEN pay.payment_type = 'matchday' THEN pay.amount END), 0) as matchday_paid,
    COUNT(pay.id) as total_payments
FROM players p
LEFT JOIN payments pay ON p.id = pay.player_id
GROUP BY p.id, p.name, p.phone, p.annual, p.monthly, p.pitch, p.match_day;

-- ENHANCED VIEW: Date-based financials with optional match day info
CREATE OR REPLACE VIEW date_financials AS
SELECT 
    financial_date,
    COALESCE(expense_totals.total_expenses, 0) as total_expenses,
    COALESCE(payment_totals.total_income, 0) as total_income,
    COALESCE(payment_totals.total_income, 0) - COALESCE(expense_totals.total_expenses, 0) as net_amount,
    COALESCE(expense_totals.expense_count, 0) as expense_count,
    COALESCE(payment_totals.payment_count, 0) as payment_count,
    -- Include match day details if available
    md.opponent,
    md.venue,
    md.match_type
FROM (
    -- Get all unique dates from both expenses and payments
    SELECT expense_date as financial_date FROM expenses
    UNION
    SELECT date as financial_date FROM payments WHERE payment_type = 'matchday'
) all_dates
LEFT JOIN (
    SELECT 
        expense_date,
        SUM(amount) as total_expenses,
        COUNT(id) as expense_count
    FROM expenses 
    GROUP BY expense_date
) expense_totals ON all_dates.financial_date = expense_totals.expense_date
LEFT JOIN (
    SELECT 
        date,
        SUM(amount) as total_income,
        COUNT(id) as payment_count
    FROM payments 
    WHERE payment_type = 'matchday'
    GROUP BY date
) payment_totals ON all_dates.financial_date = payment_totals.date
LEFT JOIN match_days md ON all_dates.financial_date = md.match_date
ORDER BY financial_date DESC;

-- NEW VIEW: Expense summary by date with optional match day details
CREATE OR REPLACE VIEW expense_summary_by_date AS
SELECT 
    e.expense_date,
    e.category,
    COUNT(e.id) as expense_count,
    SUM(e.amount) as category_total,
    AVG(e.amount) as category_average,
    -- Include match day info if available
    md.opponent,
    md.venue,
    md.match_type
FROM expenses e
LEFT JOIN match_days md ON e.match_day_id = md.id
GROUP BY e.expense_date, e.category, md.opponent, md.venue, md.match_type
ORDER BY e.expense_date DESC, e.category;

-- Insert default admin user
INSERT INTO users (name, email, role, status, password_hash) 
VALUES ('Super Admin', 'kasasatrevor25@gmail.com', 'admin', 'active', '$2b$12$LQv3c1yqBwLFG/BmFKDHUOOcWXOr9wgDKj2gTVH0J3WRgJ0tEoFdK')
ON CONFLICT (email) DO NOTHING;