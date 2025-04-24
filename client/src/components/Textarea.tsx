import React from 'react'
import { IFieldProps } from '../hooks/useDynamicForm'
import { Paper, Stack, TextField } from '@mui/material'
import { textFieldStyles } from './Inputs'

const Textarea: React.FC<IFieldProps> = ({ controllerField, field, errors }) => {
    return <>
        <Paper >
            <Stack>
                <TextField
                    {...controllerField}
                    multiline
                    type={field.type}
                    id={field.name}
                    label={field.placeholder}
                    variant="outlined"
                    sx={textFieldStyles}
                    fullWidth
                    error={Boolean(errors)}
                    rows={field.rows || 4}
                />
            </Stack>
        </Paper>
    </>
}

export default Textarea