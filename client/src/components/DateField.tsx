import React from 'react'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { IFieldProps } from '../hooks/useDynamicForm';
import { textFieldStyles } from './Inputs';
import { Paper } from '@mui/material';
import dayjs from "dayjs"

const DateField: React.FC<IFieldProps> = ({ controllerField, field, errors }) => {
    const isError = Boolean(errors)
    return <>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Paper sx={{ width: "100%" }}>
                <DatePicker
                    sx={{ ...textFieldStyles, width: "100%" }}
                    label={field.placeholder}
                    format="YYYY-MM-DD"
                    value={controllerField.value ? dayjs(controllerField.value) : null}
                    onChange={(newValue) => {
                        controllerField.onChange(newValue ? newValue.format("YYYY-MM-DD") : null);
                    }}
                    slotProps={{
                        textField: {
                            error: isError,
                        },
                    }}
                />
            </Paper>
        </LocalizationProvider>
    </>
}
export default DateField