import { AddOutlined, CategoryOutlined } from '@mui/icons-material'
import useSWR from 'swr'

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Box, Button, CardMedia, Grid, Link } from '@mui/material'

import { AdminLayout } from '../../components/layouts'
import { IProduct } from '../../interfaces'
import { render } from 'react-dom'
import NextLink from 'next/link';

const columns: GridColDef[] = [
    {
        field: 'img',
        headerName: 'Foto',
        renderCell: ({ row }: GridRenderCellParams) => {
            return (
                <a href={`/product/${row.slug}`} target="_blank" rel="noreferrer">
                    <CardMedia
                        component='img'
                        alt={row.title}
                        className='fadeIn'
                        image={row.img}
                    />
                </a>
            )
        }
    },
    {
        field: 'title',
        headerName: 'Titulo',
        width: 250,
        renderCell: ({ row }: GridRenderCellParams) => {
            return (
                <NextLink href={`/admin/products/${row.slug}`} passHref>
                    <Link underline='always'>
                        {row.title}
                    </Link>
                </NextLink>
            )
        }
    },
    { field: 'gender', headerName: 'Género' },
    { field: 'type', headerName: 'Tipo' },
    { field: 'inStock', headerName: 'Inventario' },
    { field: 'price', headerName: 'Precio' },
    { field: 'sizes', headerName: 'Tallas', width: 250 },
]

const ProductsPage = () => {

    const { data, error } = useSWR<IProduct[]>('/api/admin/products')

    if (!data && !error) return (<></>)

    const rows = data!.map(pruduct => ({
        id: pruduct._id,
        img: pruduct.images[0],
        title: pruduct.title,
        gender: pruduct.gender,
        type: pruduct.type,
        inStock: pruduct.inStock,
        price: pruduct.price,
        sizes: pruduct.sizes.join(', '),
        slug: pruduct.slug,
    }))

    return (
        <AdminLayout
            title={`Productos (${data?.length})`}
            subTitle={'Mantenimiento de productos'}
            icon={<CategoryOutlined />}
        >
            <Box display='flex' justifyContent='end' sx={{ mb: 2 }}>
                <Button
                    startIcon={<AddOutlined />}
                    color='secondary'
                    href='/admin/products/new'
                >
                    Crear producto
                </Button>
            </Box>

            <Grid container className='fadeIn'>
                <Grid item xs={12} sx={{ height: 560, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10 }
                            },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                    />
                </Grid>
            </Grid>

        </AdminLayout>
    )
}

export default ProductsPage