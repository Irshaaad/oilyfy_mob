import { NavigationProp, RouteProp } from "@react-navigation/native"

export type ScreenType = {
    navigation: NavigationProp<any, any>
    route: RouteProp<any, any>
}