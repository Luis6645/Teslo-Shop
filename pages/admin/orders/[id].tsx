import { Box, Card, CardContent, Chip, Divider, Grid, Typography } from "@mui/material"
import { GetServerSideProps, NextPage } from 'next'
import dynamic from "next/dynamic"

import { AdminLayout, ShopLayout } from "../../../components/layouts"
import { OrdenSummary } from "../../../components/cart"

import { AirplaneTicketOutlined, CreditCardOffOutlined, CreditScoreOutlined } from "@mui/icons-material";
import { dbOrders } from "../../../database"
import { IOrder } from "../../../interfaces"
import { countries } from "../../../utils"


const CartList = dynamic(() => import("../../../components/cart").then(i => i.CartList), { ssr: false, });

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

    const { ShippingAddress } = order

    return (
        <AdminLayout
            title='Resumen de la orden'
            subTitle={`Orden Id: ${order._id}`}
            icon={<AirplaneTicketOutlined />}
        >

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

                                <Box flexDirection='column' sx={{ display: 'flex', flex: 1 }}>
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
                                                <Chip
                                                    sx={{ my: 2 }}
                                                    label="Pendiente de pago"
                                                    variant='outlined'
                                                    color="error"
                                                    icon={<CreditCardOffOutlined />}
                                                />
                                            )
                                    }
                                </Box>
                            </Box>
                        </CardContent>

                    </Card>
                </Grid>
            </Grid>
        </AdminLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {

    const { id = '' } = query
    const order = await dbOrders.getOrderById(id.toString())

    if (!order) {
        return {
            redirect: {
                destination: `/admin/orders`,
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