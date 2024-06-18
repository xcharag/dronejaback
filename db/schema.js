import {gql} from 'apollo-server';

const typeDefs = gql`
    #MODELS
    type token{
        token: String
    }
    
    type examResp {
        name: String
        lastname: String
        id: ID
        count: Int
    }
    
    type User {
        id: ID
        name: String
        lastName: String
        email: String
        role: DefinedRoles
        associatedSeller: ID
    }
    
    type Product {
        id: ID
        name: String
        description: String
        stock: Int
        price: Float
        imgRoute: String
        created: String
        totalQuantity: Int
    }
    
    type Order {
        id: ID
        order: [OrderGroup]
        total: Float
        client: ID
        seller: ID
        status: DefinedStatus
        created: String
    }
    
    type OrderGroup {
        id: ID
        name: String
        quantity: Int
        price: Float
    }
    
    type BestSellers {
        id: String
        name: String
        lastName: String
        totalSpent: Float
    }
    
    type BestClients {
        id: String
        name: String
        lastName: String
        totalSpent: Float
    }
    
    type MostDaySales {
        date: String
        total: Float
    }
    
    type BestProducts {
        name: String
        description: String
        totalQuantity: Int
    }
    
    type BestClientsByDate {
         name: String
         date: String
         total: Float
     }
    
    #ENUMS
    enum DefinedRoles {
        SELLER
        CLIENT
    }
    
    enum DefinedStatus {
        PENDIENTE
        COMPLETADO
        CANCELADO
    }
    
    #INPUTS
    input UserInput {
        name: String
        lastName: String
        email: String
        password: String
        role: DefinedRoles
        associatedSeller: ID
    }
    
    input AuthenticateInput {
        email: String!
        password: String!
    }
    
    input ProductInput {
        name: String
        description: String
        stock: Int
        price: Float
    }
    
    input OrderInput {
        order: [OrderGroupInput]
        total: Float
        client: ID
        seller: ID
        status: DefinedStatus
        methodPayment: String
    }
    
    input OrderGroupInput {
        id: ID
        quantity: Int
        name: String
    }
    
    input OrderUpdate {
        status: DefinedStatus
    }
    
    #QUERIES
    type Query {
        #Users
        getUser(token: String!): User
        getUsers: [User]
        getUsersBySeller: [User]
        
        #Products
        getProducts: [Product]
        getLastAddedProducts: [Product]
        getTop3Products: [Product]
        
        #Orders
        getOrdersByClient: [Order]
        getOrdersBySeller: [Order]
        
        #Advanced Queries
        getMostSoldProducts: [BestProducts]
        getBestClients: [BestClients]
        getBestSellers: [BestSellers]
        exam: [examResp]
    }
    
    #MUTATIONS
    type Mutation {
        #Users
        newUser(input: UserInput): User
        authenticateUser(input: AuthenticateInput): token
        updateUser(id: ID!, input: UserInput): User
        
        #Products
        newProduct(input: ProductInput): Product
        updateProduct(id: ID!, input: ProductInput): Product
        deleteProduct(id: ID!): Product
        
        #Orders
        newOrder(input: OrderInput): Order
        updateOrder(id: ID!, input: OrderUpdate): Order
        deleteOrder(id: ID!): String
    }
`;

export default typeDefs;