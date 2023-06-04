import type { NextApiRequest, NextApiResponse } from 'next'
import { Order, Product, User } from '../../../models'
import { db } from '../../../database'

type Data = {
    numberOfOrders: number
    paidOrders: number // isPad true
    notPaidOrders: number
    numberOfClients: number // role: client
    numberOfProducts: number
    productsWithNoInventory: number // 0
    lowInventory: number //productos con 10 o menos unidades
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    await db.connect()

    const [
        numberOfOrders,
        paidOrders,
        numberOfClients,
        numberOfProducts,
        productsWithNoInventory,
        lowInventory,
    ] = await Promise.all([
        Order.count(),
        Order.find({ isPaid: true }).count(),
        User.find({ role: 'client' }).count(),
        Product.count(),
        Product.find({ inStock: 0 }).count(),
        Product.find({ inStock: { $lte: 10 } }).count()
    ])

    await db.disconnect()


    res.status(200).json({
        numberOfOrders,
        paidOrders,
        numberOfClients,
        numberOfProducts,
        productsWithNoInventory,
        lowInventory,
        notPaidOrders: numberOfOrders - paidOrders
    })

}