import { FC } from "react"
import { Box, IconButton, Typography } from "@mui/material"
import { RemoveCircleOutline, AddCircleOutline } from '@mui/icons-material'

interface Props {
    correntValue: number
    maxValue: number

    //Methods
    updatedQuantity: (newValue: number) => void
}
export const ItemCouter: FC<Props> = ({ correntValue, maxValue, updatedQuantity }) => {

    const addOrRemove = (value: number) => {
        if (value === -1) {
            if (correntValue === 1) return

            return updatedQuantity(correntValue - 1)
        }

        if (correntValue >= maxValue) return

        return updatedQuantity(correntValue + 1)
    }


    return (
        <Box display='flex' alignItems='center'>
            <IconButton onClick={() => addOrRemove(-1)}>
                <RemoveCircleOutline />
            </IconButton>
            <Typography sx={{ width: 40, textAlign: 'center' }}>{correntValue}</Typography>
            <IconButton onClick={() => addOrRemove(+1)}>
                <AddCircleOutline />
            </IconButton>
        </Box>
    )
}
