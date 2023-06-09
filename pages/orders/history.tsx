import React from 'react'
import { GetServerSideProps, NextPage } from 'next'
import { getSession } from 'next-auth/react';
import NextLink from 'next/link';

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Typography, Grid, Chip, Link } from '@mui/material';

import { ShopLayout } from '../../components/layouts'
import { dbOrders } from '../../database';
import { IOrder } from '../../interfaces';

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'fullname', headerName: 'Nombre Completo', width: 300 },

    {
        field: 'paid',
        headerName: 'Pagada',
        description: 'Muestra informacion si está pagada la orden o no',
        width: 200,
        renderCell: (params: GridRenderCellParams) => {
            return (
                params.row.paid
                    ? <Chip color='success' label='Pagada' variant='outlined' />
                    : <Chip color='error' label='No Pagada' variant='outlined' />
            )
        }
    },
    {
        field: 'orden',
        headerName: 'Ver orden',
        width: 200,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => {
            return (
                <NextLink href={`/orders/${params.row.orderId}`} passHref legacyBehavior>
                    <Link underline='always'>
                        Ver orden
                    </Link>
                </NextLink>
            )
        }
    }
]

interface Props {
    orders: IOrder[]
}

const HistoryPage: NextPage<Props> = ({ orders }) => {

    const rows = orders.map((order, idx) => ({
        id: idx + 1,
        paid: order.isPaid,
        fullname: `${order.ShippingAddress.firstName} ${order.ShippingAddress.lastName}`,
        orderId: order._id,
    }))
    return (
        <ShopLayout title='Historial de ordenes' pageDescription={'Historial de ordenes del cliente'}>
            <Typography variant='h1' component='h1'>Historias de ordenes</Typography>
            <Grid container className='fadeIn'>
                <Grid item xs={12} sx={{ height: 560, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 5 }
                            },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                    />
                </Grid>
            </Grid>
        </ShopLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
export const getServerSideProps: GetServerSideProps = async ({ req }) => {

    const sessions: any = await getSession({ req })

    if (!sessions) {
        return {
            redirect: {
                destination: `/auth/login?p=/orders/history`,
                permanent: false
            }
        }
    }

    const orders = await dbOrders.getOrdersByUser(sessions.user.id)

    return {
        props: {
            orders
        }
    }
}
export default HistoryPage