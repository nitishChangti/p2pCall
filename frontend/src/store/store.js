import {configureStore} from '@reduxjs/toolkit'
import authSlice from './authSlice'
import callSlice from './callSlice'
import socketSlice from './socketSlice'
const store = configureStore({
    reducer:{
        auth :authSlice,
        _socket : socketSlice,
        _call :callSlice
    }
})

export default store