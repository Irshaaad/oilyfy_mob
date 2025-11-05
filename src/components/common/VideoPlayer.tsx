import React, { useContext, useEffect, useRef } from 'react';
import { AppState, StyleSheet } from 'react-native';
// import VideoPlayer, { VideoPlayerRef } from 'react-native-video-player';
import { AppThemeContext } from '../../Contexts/ThemeProviders';
import { DEMO_VIDEO } from '../../utils/constants';
import { AppThemeType } from '../../utils/interface';
import { useNavigation } from '@react-navigation/native';

interface VideoPlayerInterface {
    uri: string;
    thumbnail?: string;
}

const CustomVideoPlayer: React.FC<VideoPlayerInterface> = (props) => {
    return <></>
    const { uri } = props;
    const { theme } = useContext(AppThemeContext)
    const styles = dynamicStyles(theme)
    const navigation = useNavigation()
    const videoRef = useRef<VideoPlayerRef>(null)

    React.useEffect(
        () =>
            navigation.addListener('beforeRemove', (e) => {
                e.preventDefault();
                videoRef.current?.stop()
                console.log("VIDEO REG", videoRef.current)

                navigation.dispatch(e.data.action)
            }),
        [navigation]
    );

    React.useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            console.log('App State changed to', nextAppState);

            if (nextAppState === 'background' || nextAppState === "inactive") {
                // App is going to the background, perform actions here
                videoRef.current?.stop()

                console.log(`App is closing or going to ${nextAppState}`);
                // Example: Save data or pause tasks
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <VideoPlayer
            source={{ uri: uri || DEMO_VIDEO }}
            ref={videoRef}
        />
    );
};

export default CustomVideoPlayer;

const dynamicStyles = (theme: AppThemeType) => StyleSheet.create({
    container: {
        flex: 1,
    }
});