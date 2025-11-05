import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { setGuest } from '../../redux/reducers/userSlice'
import { useAppDispatch, useAppSelector } from '../../redux/store'

export const useUser = () => {

    const dispatch = useAppDispatch()
    const navigation: NavigationProp<any> = useNavigation()
    const isGuest = useAppSelector(store => store.userSlice.isGuest)
    const loginType = useAppSelector(store => store.userSlice.loginType)

    const handleLogout = async () => {
        console.log("LOGGING OUT")
        if (loginType === "google") {
            // await handleGoogleLogout()
        }
        dispatch({ type: "LOGOUT", payload: null })
        navigation.dispatch(StackActions.replace("Login"))
    }

    const handleDeleteAccount = () => { }
    const handleGuestLogin = () => {
        navigation.dispatch(StackActions.replace("Home"))
        dispatch(setGuest(true))
    }

    return { handleLogout, handleDeleteAccount, handleGuestLogin }
}