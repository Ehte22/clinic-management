import { FormControl, InputLabel, MenuItem, Paper, Select, Stack } from '@mui/material'
import React from 'react'
import { IFieldProps } from '../hooks/useDynamicForm'
import { textFieldStyles } from './Inputs'

const Selects: React.FC<IFieldProps> = ({ controllerField, field, errors }) => {
    const isError = Boolean(errors)
    return <>
        <Paper >
            <Stack>
                <FormControl fullWidth sx={textFieldStyles} error={Boolean(errors)}>
                    <InputLabel>{field.placeholder}</InputLabel>
                    <Select
                        error={isError}
                        {...controllerField}
                        value={controllerField.value || ""}
                        onChange={controllerField.onChange}
                        label={field.placeholder}
                    >
                        {field.options && field.options.length > 0 ? (
                            field.options.map((item, i) => (
                                <MenuItem key={i} value={item.label} disabled={item.disabled}>
                                    {item.label}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>No {field.label || "Data"} Found</MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Stack>
        </Paper >
    </>
}

export default Selects