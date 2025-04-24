import { Autocomplete, Paper, TextField } from '@mui/material'
import React from 'react'
import { IFieldProps } from '../hooks/useDynamicForm'
import { textFieldStyles } from './Inputs'

const AutoComplete: React.FC<IFieldProps> = ({ controllerField, field, errors }) => {
    const isError = Boolean(errors)
    return <>
        <Paper>
            <Autocomplete
                multiple={field.multiple || false}
                value={
                    field.multiple
                        ? field.options?.filter(opt => controllerField.value?.includes(opt.value)) || []
                        : field.options?.find(opt => opt.value === controllerField.value) || null}
                onChange={(_, newValue) => {
                    if (field.multiple) {
                        if (Array.isArray(newValue)) {
                            const values = newValue.map(option => option.value)
                            controllerField.onChange(values);
                        } else {
                            controllerField.onChange("");
                        }
                    } else {
                        if (newValue && !Array.isArray(newValue) && "value" in newValue) {
                            controllerField.onChange(newValue.value);
                        } else {
                            controllerField.onChange("");
                        }
                    }
                }}
                sx={textFieldStyles}
                disablePortal
                options={field?.options || []}
                renderInput={(params) => <TextField
                    variant='outlined'
                    error={isError} {...params}
                    label={field.placeholder} />}
            />
        </Paper>
    </>
}

export default AutoComplete