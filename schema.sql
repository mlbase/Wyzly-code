-- Wyzly Box Database Schema
-- Created: 2025-08-18
-- Description: Database schema for Wyzly Box food ordering system

-- Users table with role-based access
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('restaurant', 'customer', 'admin')) NOT NULL DEFAULT 'customer',
    phone_number VARCHAR(20),
    age INTEGER,
    gender VARCHAR(10),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    description TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boxes table (food items)
CREATE TABLE boxes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    image VARCHAR(500),
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory commands for tracking stock changes
CREATE TABLE inventory_commands (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) CHECK (type IN ('increase', 'decrease')) NOT NULL,
    box_id INTEGER REFERENCES boxes(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    box_id INTEGER REFERENCES boxes(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')) NOT NULL DEFAULT 'pending',
    is_cancelled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cancel orders table for tracking cancellation requests
CREATE TABLE cancel_orders (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_approved BOOLEAN DEFAULT false,
    admin_id INTEGER REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

-- Payments table for order payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) NOT NULL DEFAULT 'pending',
    method VARCHAR(20) CHECK (method IN ('credit_card', 'debit_card', 'paypal', 'cash', 'mock')) NOT NULL DEFAULT 'mock',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_boxes_restaurant_id ON boxes(restaurant_id);
CREATE INDEX idx_boxes_is_available ON boxes(is_available);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_inventory_commands_box_id ON inventory_commands(box_id);
CREATE INDEX idx_cancel_orders_order_id ON cancel_orders(order_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boxes_updated_at BEFORE UPDATE ON boxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample Data
-- Note: In production, passwords should be properly hashed (bcrypt, etc.)

-- Insert admin user
INSERT INTO users (email, username, password, role, phone_number) VALUES
('admin@wyzly.com', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '+1-555-0001');

-- Insert restaurant owners
INSERT INTO users (email, username, password, role, phone_number, age, gender, address) VALUES
('pasta_palace@example.com', 'pasta_palace_owner', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'restaurant', '+1-555-0101', 35, 'male', '123 Italian St, New York, NY'),
('sushi_zen@example.com', 'sushi_zen_owner', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'restaurant', '+1-555-0102', 42, 'female', '456 Tokyo Ave, Los Angeles, CA'),
('burger_barn@example.com', 'burger_barn_owner', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'restaurant', '+1-555-0103', 29, 'male', '789 Grill Rd, Austin, TX'),
('taco_fiesta@example.com', 'taco_fiesta_owner', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'restaurant', '+1-555-0104', 38, 'female', '321 Salsa Blvd, Phoenix, AZ');

-- Insert restaurants
INSERT INTO restaurants (name, phone_number, description, owner_id) VALUES
('Pasta Palace', '+1-555-1001', 'Authentic Italian cuisine with handmade pasta and traditional recipes passed down through generations.', 2),
('Sushi Zen', '+1-555-1002', 'Fresh sushi and Japanese delicacies prepared by master chefs with premium ingredients.', 3),
('Burger Barn', '+1-555-1003', 'Gourmet burgers made with locally sourced beef and artisanal buns, served with crispy fries.', 4),
('Taco Fiesta', '+1-555-1004', 'Vibrant Mexican street food with bold flavors, fresh ingredients, and homemade salsas.', 5);

-- Insert sample boxes (food items) with working image URLs
INSERT INTO boxes (title, price, quantity, image, restaurant_id, is_available) VALUES
-- Pasta Palace boxes
('Classic Spaghetti Carbonara Box', 15.99, 25, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&crop=center&auto=format', 1, true),
('Chicken Parmigiana Box', 18.50, 20, 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&h=600&fit=crop&crop=center&auto=format', 1, true),
('Vegetarian Lasagna Box', 16.75, 15, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop&crop=center&auto=format', 1, true),

-- Sushi Zen boxes
('California Roll Combo Box', 22.00, 30, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop&crop=center&auto=format', 2, true),
('Salmon Teriyaki Bento Box', 24.50, 18, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&h=600&fit=crop&crop=center&auto=format', 2, true),
('Vegetarian Sushi Box', 19.99, 12, 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop&crop=center&auto=format', 2, true),

-- Burger Barn boxes
('Classic Cheeseburger Box', 12.99, 35, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&crop=center&auto=format', 3, true),
('BBQ Bacon Burger Box', 15.50, 28, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop&crop=center&auto=format', 3, true),
('Veggie Deluxe Burger Box', 13.75, 22, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&h=600&fit=crop&crop=center&auto=format', 3, true),

-- Taco Fiesta boxes
('Street Taco Trio Box', 11.99, 40, 'https://images.unsplash.com/photo-1565299585323-38174c26a933?w=800&h=600&fit=crop&crop=center&auto=format', 4, true),
('Chicken Quesadilla Box', 13.50, 25, 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&h=600&fit=crop&crop=center&auto=format', 4, true),
('Carnitas Burrito Bowl Box', 14.25, 30, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&crop=center&auto=format', 4, true);

-- Insert sample customers
INSERT INTO users (email, username, password, role, phone_number, age, gender, address) VALUES
('john.doe@example.com', 'john_doe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', '+1-555-2001', 28, 'male', '111 Customer St, Seattle, WA'),
('jane.smith@example.com', 'jane_smith', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', '+1-555-2002', 34, 'female', '222 Buyer Ave, Portland, OR');

-- Insert sample orders
INSERT INTO orders (user_id, box_id, quantity, total_price, status) VALUES
(6, 1, 2, 31.98, 'completed'),
(6, 4, 1, 22.00, 'preparing'),
(7, 7, 1, 12.99, 'pending'),
(7, 10, 3, 35.97, 'confirmed');

-- Insert sample payments
INSERT INTO payments (order_id, amount, status, method) VALUES
(1, 31.98, 'completed', 'mock'),
(2, 22.00, 'pending', 'mock'),
(3, 12.99, 'pending', 'mock'),
(4, 35.97, 'completed', 'mock');

-- Insert sample inventory commands
INSERT INTO inventory_commands (type, box_id, quantity, previous_quantity) VALUES
('increase', 1, 5, 20),
('decrease', 1, 2, 25),
('increase', 4, 10, 20),
('decrease', 7, 1, 36),
('decrease', 10, 3, 33);