import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config({ path: '.env' });

const createToken = (user, secret, expiresIn) => {
    const { id, email, name, lastName } = user;
    return jwt.sign({ id, email, name, lastName }, secret, { expiresIn });
}

const resolvers = {
    Query: {
        getUser: async (_, {token}) => {
            try {
                const userId = await jwt.verify(token, process.env.SECRET);
                const userData = await User.findById(userId.id);
                return userData;
            } catch (e) {
                console.log("Error al devolver el usuario: " + e);
                return {};
            }
        },

        getUsers: async () => {
            try {
                const users = await User.find({});
                return users;
            } catch (e) {
                console.log("Error al devolver los usuarios: " + e);
                return {};
            }
        },

        getUsersBySeller: async (_, {}, ctx) => {
            try {
                const users = await User.find({associatedSeller: ctx.user.id});
                return users;
            } catch (e) {
                console.log("Error al devolver los usuarios: " + e);
                return {};
            }
        },

        getProducts: async () => {
            try {
                const products = await Product.find({});
                return products;
            } catch (e) {
                console.log("Error al devolver los productos: " + e);
                return {};
            }
        },

        getLastAddedProducts: async () => {
            try {
                const products = await Product.find({}).sort({ created: -1 }).limit(3);
                return products;
            } catch (e) {
                console.log("Error al devolver los productos: " + e);
                return {};
            }
        },

        getTop3Products: async () => {
            try {
                const products = await Product.find({}).sort({ totalQuantity: -1 }).limit(3);
                return products;
            } catch (e) {
                console.log("Error al devolver los productos: " + e);
                return {};
            }
        },

        getOrdersByClient: async (_, {}, ctx) => {
            try {
                const orders = await Order.find({ client: ctx.user.id });
                return orders;
            } catch (e) {
                console.log("Error al devolver los pedidos: " + e);
                return {};
            }
        },

        getOrdersBySeller: async (_, {}, ctx) => {
            try {
                const orders = await Order.find({ seller: ctx.user.id });
                return orders;
            } catch (e) {
                console.log("Error al devolver los pedidos: " + e);
                return {};
            }
        },

        getMostSoldProducts: async () => {
            const pipeline = [
                {
                    $unwind: "$order"
                },
                {
                    $addFields:{
                        'order.id': {$toObjectId: "$order.id"}
                    }
                },
                {
                    $group:{
                        _id: "$order.id",
                        totalQuantity: {$sum: "$order.quantity"}
                    }
                },
                {
                    $sort:{
                        totalQuantity: -1
                    }
                },
                {
                    $lookup:{
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $unwind: "$product"
                },
                {
                    $project:{
                        _id: 0,
                        name: "$product.name",
                        description: "$product.description",
                        totalQuantity: 1
                    }
                }
            ];
            try {
                const products = await Order.aggregate(pipeline);
                return products;
            } catch (e) {
                console.log("Error al devolver los productos: " + e);
                return {};
            }
        },

        getBestSellers: async () => {
            const pipeline = [
                {
                    $group: {
                        _id: "$seller",
                        totalSpent: { $sum: "$total" }
                    }
                },
                {
                    $addFields:{
                        seller: {$toObjectId: "$_id"}
                    }
                },
                {
                    $lookup:{
                        from: "users",
                        localField: "seller",
                        foreignField: "_id",
                        as: "sellerdata"
                    }
                },
                {
                    $unwind: "$sellerdata"
                },
                {
                    $project:{
                        _id: "$sellerdata._id",
                        name: "$sellerdata.name",
                        lastName: "$sellerdata.lastName",
                        totalSpent: 1
                    }
                },
                {
                    $sort:{
                        totalSpent: -1
                    }
                },
                {
                    $limit: 3
                }
                ];
            try {
                const sellers = await Order.aggregate(pipeline);
                return sellers;
            } catch (e) {
                console.log("Error al devolver los vendedores: " + e);
                return {};
            }
        },

        getBestClients: async () => {
            const pipeline = [
                {
                    $group: {
                        _id: "$client",
                        totalSpent: { $sum: "$total" }
                    }
                },
                {
                    $addFields:{
                        seller: {$toObjectId: "$_id"}
                    }
                },
                {
                    $lookup:{
                        from: "users",
                        localField: "seller",
                        foreignField: "_id",
                        as: "clientdata"
                    }
                },
                {
                    $unwind: "$clientdata"
                },
                {
                    $project:{
                        _id:0,
                        id: "$clientdata._id",
                        name: "$clientdata.name",
                        lastName: "$clientdata.lastName",
                        totalSpent: 1
                    }
                },
                {
                    $sort:{
                        totalSpent: -1
                    }
                }
            ];
            try {
                const clients = await Order.aggregate(pipeline);
                return clients;
            } catch (e) {
                console.log("Error al devolver los clientes: " + e);
                return {};
            }
        },

        clientesporseller: async () => {
            const pipeline = [
                {
                    $group:{
                        _id: "$associatedSeller",
                        count: {$sum: 1}
                    }
                },
                {
                    $addFields:{
                        seller: {$toObjectId: "$_id"}
                    }
                },
                {
                    $lookup:{
                        from: "users",
                        localField: "seller",
                        foreignField: "_id",
                        as: "sellerdata"
                    }
                },
                {
                    $unwind: "$sellerdata"
                },
                {
                    $project:{
                        _id: 0,
                        id: "$sellerdata._id",
                        name: "$sellerdata.name",
                        lastName: "$sellerdata.lastName",
                        count: 1
                    }
                }
                ];
            try {
                const users = await User.aggregate(pipeline);
                return users;
            } catch (e) {
                console.log("Error al devolver los usuarios: " + e);
                return {};
            }
        }
    },

    Mutation: {
        newUser: async (_, {input}) => {
            const {email, password} = input;
            const userExists = await User.findOne({email});
            if (userExists) {
                throw new Error('El usuario ya está registrado');
            }

            const salt = await bcrypt.genSalt(10);
            input.password = await bcrypt.hash(password, salt);

            try {
                const user = new User(input);
                await user.save();
                return user;
            } catch (e) {
                console.log("Error al registrar el usuario: " + e);
                return {};
            }
        },

        authenticateUser: async (_, {input}) => {
            const {email, password} = input;
            const userExists = await User.findOne({email});
            if (!userExists) {
                throw new Error('El usuario no está registrado');
            }

            const passwordCorrect = await bcrypt.compare(password, userExists.password);
            if (!passwordCorrect) {
                throw new Error('La contraseña es incorrecta');
            }

            return {
                token: createToken(userExists, process.env.SECRET, '24h')
            }
        },

        updateUser: async (_, {id, input}, ctx) => {
                let user = await User.findById(id);
                if (!user) {
                    throw new Error('Usuario no encontrado');
                }

                if (user.associatedSeller.toString() !== ctx.user.id) {
                    throw new Error('No tienes las credenciales para actualizar este usuario');
                }
            try {
                user = await User.findOneAndUpdate({_id: id}, input, {new: true});
                console.log(user);
                return user;
            } catch (e) {
                console.log("Error al actualizar el usuario: " + e);
                return {
                    error: e
                }
            }
        },

        // PRODUCTS
        newProduct: async (_, {input}) => {
            try {
                console.log(input);
                const product = new Product(input);
                await product.save();
                return product;
            } catch (e) {
                console.log("Error al registrar el producto: " + e);
                return {};
            }
        },

        updateProduct: async (_, {id, input}) => {
            let product = await Product.findById(id);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            console.log(product);
            console.log(input);
            try {
                product = await Product.findOneAndUpdate({_id: id}, input, {new: true});
                return product;
            } catch (e) {
                console.log("Error al actualizar el producto: " + e);
                return {};
            }
        },

        deleteProduct: async (_, {id}) => {
            let product = await Product.findOneAndDelete({_id: id});
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            return product;
        },

        //ORDERS
        newOrder: async (_, {input}) => {
            const {order} = input;
            for await (const item of order) {
                const {id} = item;
                const product = await Product.findById(id);
                console.log(input);
                console.log(product);
                if (item.quantity > product.stock) {
                    throw new Error(`El producto: ${product.name} excede la cantidad disponible`);
                } else {
                    product.stock = product.stock - item.quantity;
                    await product.save();
                }
            }

            const newOrder = new Order(input);
            await newOrder.save();
            return newOrder;
        },

        updateOrder: async (_, {id, input}) => {
            let order = await Order.findById(id);
            if (!order) {
                throw new Error('Pedido no encontrado');
            }

            try {
                order = await Order.findOneAndUpdate({_id: id}, input, {new: true});
                return order;
            } catch (e) {
                console.log("Error al actualizar el pedido: " + e);
                return {};
            }
        },

        deleteOrder: async (_, {id}) => {
            let order = await Order.findOneAndDelete({_id: id});
            if (!order) {
                throw new Error('Pedido no encontrado');
            }
            return order;
        }
    }
}

export default resolvers;