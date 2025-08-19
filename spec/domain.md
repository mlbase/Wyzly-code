# Domain definition

### 1. User
- id
- Role: 
    - Restaurant: Create, update, delete a "Wyzly Box" (title, price, quantity, image).
    - Customer: View boxes, purchase (mock payment), view order history.
    - Admin: View all orders, mark them as complete.
- has email that verified(in this project it skipped)
- has phonenumber that verified(in this project it skipped)
- password
- username
- login by email and password
- optionally have personal information age, gender, address

### 2. Restaurant
- id
- name
- phone_number
- description

### 3. Box
- id
- title 
- price
- quantity
- image
- restaurantId
- isAvailable
- can restaurant role user can change these of thing

### 4. InventoryCommand
- id
- type: increase/ decrease
- boxId
- quantity: increase/ decrease command
- previous_quantity: quantity before command

### 5. Order
- ID -> is a key for validation check at real world(using QR code)
- userID -> ordered user id
- isCanceld -> is order canceled
- boxId -> ordered box id
- quantity

### 6. CancelOrder
- ID
- orderId
- userId
- isApproved -> order cancel approved by admin

### 7. Payment
- id
- orderId
- amount
- status
- method

### 8. WishList
- userId
- boxId
- quantity