import type { NextPage, GetServerSideProps } from 'next';
import { Box, Typography } from '@mui/material'

import { ShopLayout } from '../../components/layouts';

import { ProductList } from '../../components/products';

import { dbProducts } from '../../database';
import { IProduct } from '../../interfaces';

interface Props {
    products: IProduct[]
    foudProducts: boolean
    query: string
}
const SearchPage: NextPage<Props> = ({ products, foudProducts, query }) => {

    return (
        <ShopLayout title={'Teslo-Shop - Search'} pageDescription={'Encuentra los mejores productos de Teslo aqui'}>
            <Typography variant="h1" component="h1">Buscar productos</Typography>

            {
                foudProducts
                    ? <Typography variant="h2" sx={{ mb: 1 }} textTransform='capitalize'>Término: {query}</Typography>
                    : (
                        <Box display="flex" >
                            <Typography variant="h2" sx={{ mb: 1 }}>No encontramos ningún producto</Typography>
                            <Typography variant="h2" sx={{ ml: 1 }} color="secondary" textTransform='capitalize'>{query}</Typography>
                        </Box>
                    )
            }


            <ProductList
                products={products}
            />

        </ShopLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
export const getServerSideProps: GetServerSideProps = async ({ params }) => {

    const { query = '' } = params as { query: string };

    if (query.length === 0) {
        return {
            redirect: {
                destination: '/',
                permanent: true
            }
        }
    }

    //si no hay productos
    let products = await dbProducts.getProductsByTerm(query);
    const foudProducts = products.length > 0;

    //TODO: retornar otros productos
    if (!foudProducts) {
        //products = await dbProducts.getAllProducts();
        products = await dbProducts.getProductsByTerm('shirt');
    }

    return {
        props: {
            products,
            foudProducts,
            query
        }
    }
}

export default SearchPage