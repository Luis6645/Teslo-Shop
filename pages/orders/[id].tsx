import { Box, Card, CardContent, Chip, CircularProgress, Divider, Grid, Typography } from "@mui/material"
import { GetServerSideProps, NextPage } from 'next'
import dynamic from "next/dynamic"
import { PayPalButtons } from "@paypal/react-paypal-js"

import { ShopLayout } from "../../components/layouts"
import { OrdenSummary } from "../../components/cart"

import { CreditCardOffOutlined, CreditScoreOutlined } from "@mui/icons-material";
import { getSession } from "next-auth/react"
import { dbOrders } from "../../database"
import { IOrder } from "../../interfaces"
import { countries } from "../../utils"
import { Order } from "../../models"
import { tesloApi } from "../../api"
import { useRouter } from "next/router"
import { useState } from "react"

const CartList = dynamic(() => import("../../components/cart").then(i => i.CartList), { ssr: false, });

export type OrderResponseBody = {
    id: string
    status:
    | "COMPLETED"
    | "SAVED"
    | "APPROVED"
    | "VOIDED"
    | "PAYER_ACTION_REQUIRED"
    | "CREATED"
}

interface Props {
    order: IOrder
}

const OrderPage: NextPage<Props> = ({ order }) => {

    const router = useRouter()
    const { ShippingAddress } = order
    const [isPaying, setisPaying] = useState(false)

    const onOrderCompleted = async (details: OrderResponseBody) => {

        if (details.status !== "COMPLETED") {
            return alert("No hay pago en Paypal")
        }

        setisPaying(true)

        try {

            const { data } = await tesloApi.post(`/orders/pay`, {
                transactionId: details.id,
                orderId: order._id
            })

            router.reload()

        } catch (error) {
            setisPaying(false)
            console.log(error)
            alert('Error')
        }
    }

    return (
        <ShopLayout title='Resumen de la orden' pageDescription='Resumen de la orden'>
            <Typography variant='h1' component='h1'>Orden:  {order._id}</Typography>
            {
                order.isPaid
                    ?
                    (<Chip
                        sx={{ my: 2 }}
                        label="Orden ya fue pagada"
                        variant='outlined'
                        color="success"
                        icon={<CreditScoreOutlined />}
                    />)
                    :
                    (<Chip
                        sx={{ my: 2 }}
                        label="Pendiente de pago"
                        variant='outlined'
                        color="error"
                        icon={<CreditCardOffOutlined />}
                    />)
            }

            <Grid container className='fadeIn'>
                <Grid item xs={12} sm={7}>
                    <CartList products={order.orderItems} />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Card className='summary-card'>
                        <CardContent>
                            <Typography variant='h2'>Resumen ({order.numberOfItems} {order.numberOfItems > 1 ? 'productos' : 'producto'})</Typography>
                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Dirección de entrega</Typography>
                            </Box>

                            <Typography>{ShippingAddress.firstName} {ShippingAddress.lastName}</Typography>
                            <Typography>{ShippingAddress.address} {ShippingAddress.address2 ? `, ${ShippingAddress.address2}` : ''}</Typography>
                            <Typography>{ShippingAddress.city}, {ShippingAddress.zip}</Typography>
                            <Typography>{countries.find(c => c.code === ShippingAddress.country)?.name}</Typography>
                            <Typography>{ShippingAddress.phone}</Typography>

                            <Divider sx={{ my: 1 }} />

                            <OrdenSummary orderValues={{
                                numberOfItems: order.numberOfItems,
                                subTotal: order.subTotal,
                                tax: order.tax,
                                total: order.total,
                            }}
                            />

                            <Box sx={{ mt: 3 }} display='flex' flexDirection='column'>

                                <Box
                                    display='flex'
                                    justifyContent='center'
                                    className='fadeIn'
                                    sx={{ display: isPaying ? 'flex' : 'none' }}
                                >
                                    <CircularProgress />
                                </Box>

                                <Box sx={{ display: isPaying ? 'none' : 'flex', flex: 1 }} flexDirection='column'>
                                    {
                                        order.isPaid
                                            ? (
                                                <Chip
                                                    sx={{ my: 2 }}
                                                    label="Orden ya fue pagada"
                                                    variant='outlined'
                                                    color="success"
                                                    icon={<CreditScoreOutlined />}
                                                />
                                            )
                                            : (
                                                <PayPalButtons
                                                    createOrder={(data, actions) => {
                                                        return actions.order.create({
                                                            purchase_units: [
                                                                {
                                                                    amount: {
                                                                        value: order.total.toString(),
                                                                    },
                                                                },
                                                            ],
                                                        });
                                                    }}
                                                    onApprove={(data, actions) => {
                                                        return actions.order!.capture().then((details) => {
                                                            onOrderCompleted(details)
                                                        })
                                                    }}
                                                />
                                            )
                                    }
                                </Box>
                            </Box>
                        </CardContent>

                    </Card>
                </Grid>
            </Grid>
        </ShopLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {

    const { id = '' } = query
    const sessions: any = await getSession({ req })

    if (!sessions) {
        return {
            redirect: {
                destination: `/auth/login?p=/orders/${id}`,
                permanent: false
            }
        }
    }

    const order = await dbOrders.getOrderById(id.toString())

    if (!order) {
        return {
            redirect: {
                destination: `/orders/history`,
                permanent: false
            }
        }
    }

    if (order.user !== sessions.user.id) {
        return {
            redirect: {
                destination: `/orders/history`,
                permanent: false
            }
        }
    }

    return {
        props: {
            order
        }
    }
}

export default OrderPage