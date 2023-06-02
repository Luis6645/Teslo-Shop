import { useContext, useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Link, Typography } from "@mui/material"
import NextLink from 'next/link';
import dynamic from "next/dynamic";

import { ShopLayout } from "../../components/layouts"
import { OrdenSummary } from "../../components/cart"
import { CartContext } from "../../context";
import { countries } from "../../utils";
import Cookies from "js-cookie";
import { useRouter } from "next/router";


const CartList = dynamic(() => import("../../components/cart").then(i => i.CartList), { ssr: false, });

const SummaryPage = () => {

    const router = useRouter()
    const { shippingAddress, numberOfItems, createOrder } = useContext(CartContext)

    const [isPosting, setIsPosting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (!Cookies.get('firstName')) {
            router.push('/checkout/address')
        }
    }, [router])

    const onCreateOrder = async () => {
        setIsPosting(true)

        const { hasError, message } = await createOrder()

        if (hasError) {
            setIsPosting(false)
            setErrorMessage(message)
            return
        }

        router.replace(`/orders/${message}`)
    }

    if (!shippingAddress) {
        return (<></>)
    }

    const { firstName, lastName, address, address2 = '', zip, city, country, phone } = shippingAddress;

    return (
        <ShopLayout title='Resumen de orden' pageDescription='Resumen de la orden'>
            <Typography variant='h1' component='h1'>Resumen de la orden</Typography>

            <Grid container>
                <Grid item xs={12} sm={7}>
                    <CartList />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Card className='summary-card'>
                        <CardContent>
                            <Typography variant='h2'>Resumen ({numberOfItems} {numberOfItems > 1 ? 'productos' : 'producto'})</Typography>
                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Dirección de entrega</Typography>
                                <NextLink href='/checkout/address' passHref legacyBehavior>
                                    <Link underline="always">
                                        Editar
                                    </Link>
                                </NextLink>
                            </Box>

                            <Typography>{firstName} {lastName}</Typography>
                            <Typography>{address} {address2 ? `, ${address2}` : ''}</Typography>
                            <Typography>{city}, {zip}</Typography>
                            <Typography>{countries.find(c => c.code === country)?.name}</Typography>
                            <Typography>{phone}</Typography>

                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='end'>
                                <NextLink href='/cart' passHref legacyBehavior>
                                    <Link underline="always">
                                        Editar
                                    </Link>
                                </NextLink>
                            </Box>

                            <OrdenSummary />

                            <Box sx={{ mt: 3 }} display='flex' flexDirection='column'>
                                <Button
                                    color="secondary"
                                    className='circular-btn'
                                    fullWidth
                                    onClick={onCreateOrder}
                                    disabled={isPosting}
                                >
                                    Confirmar Orden
                                </Button>

                                <Chip
                                    color='error'
                                    label={errorMessage}
                                    sx={{ display: errorMessage ? 'flex' : 'none', mt: 2 }}
                                />
                            </Box>
                        </CardContent>

                    </Card>
                </Grid>
            </Grid>
        </ShopLayout>
    )
}

export default SummaryPage