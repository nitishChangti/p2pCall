import axios from 'axios'
class AuthService{
    BaseUrl = import.meta.env.VITE_BASE_URL;

    async SignUp(name,email,password){
        console.log(name,email,password);
        try {
            const response = await axios.post(`${this.BaseUrl}/users/register`,{
                name,
                email,
                password
            },
             { withCredentials: true } // 🔥 REQUIRED
        )
            return response;
        } catch(error){
            console.error(`❌ Error occured in register api : ${error}`)
            throw error;
        }
    }

    async SignIn(email,password){
        try {
            const response = await axios.post(`${this.BaseUrl}/users/login`,{
                email,
                password
            },{
                withCredentials:true
            })
            return response
        } catch (error) {
            console.error(`❌ Error occured while doing login`,error)
            throw error
        }
    }

    async getCurrentUser(){
        try{

            const response = await axios.get(`${this.BaseUrl}/users/getCurrentUserData`,
                {
                    withCredentials:true
                }
            )
            return response;
        }
        catch(error){
            console.error(`❌ Error is occured while fetching user Data for getCurrentUserData`,error);
            throw error
        }
    }
     async logOut(){
        try {
            const response = await axios.get(`${this.BaseUrl}/users/logout`,{
                withCredentials:true
            })
            return response
        } catch (error) {
            console.error(`❌ Error occured while doing logout`,error)
            throw error
        }
    }
}

const authService = new AuthService()
export{
    authService
}