import { createContext, useEffect, useState } from "react"
import { AppThemeType } from "../utils/interface"
import { reduxPersistStorage as mmkv } from "../redux/mmkv-middleware"

export type ThemeContextType = {
    theme: AppThemeType;
    toggleTheme: (arg?: AppThemeType) => void
}

export const AppThemeContext = createContext<ThemeContextType>({ theme: 'dark', toggleTheme: () => { } })

export const ThemeProviders: React.FC<{ children: React.ReactNode }> = (props) => {
    const { children } = props

    const [theme, setTheme] = useState<AppThemeType>('dark')

    const toggleTheme = async (mode?: AppThemeType) => {
        if (!!mode) {
            setTheme(mode)
            await mmkv.setItem('apptheme', mode)
        } else {
            let themeMode: AppThemeType = theme === 'dark' ? 'light' : 'dark'
            setTheme(themeMode)
            await mmkv.setItem('apptheme', themeMode)
        }
    }

    useEffect(() => {
        (async () => {
            const appTheme = await mmkv.getItem('apptheme') as AppThemeType
            console.log("APP THEME IN MMKV", appTheme)
            if (appTheme) {
                setTheme(appTheme)
            } else {
                await mmkv.setItem('apptheme', theme)
            }
        })()
    }, [])

    return (
        <AppThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </AppThemeContext.Provider>
    )
}