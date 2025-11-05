import { useEffect } from 'react';
import notifee, { AndroidChannel, AndroidImportance, AndroidVisibility, AuthorizationStatus, EventType, Notification, RepeatFrequency, TimestampTrigger, TriggerType } from '@notifee/react-native';
import { Platform } from 'react-native';

export const useNotifications = () => {

    async function requestUserPermission() {
        const settings = await notifee.requestPermission({
            announcement: true,
            alert: true,
            badge: true,
            provisional: true,
            sound: true,
        });

        if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
            console.log("User had granted the Notification")
            if (Platform.OS === 'android') {
                createNotificationChannelAndroid({ id: 'default', name: "Default Channel" })
                createNotificationChannelAndroid({ id: 'messages', name: "Messages Channel", visibility: AndroidVisibility.PRIVATE })
            }
        } else {
            console.log('User declined permissions');
        }
    }

    async function checkChannelPermission(channelId: string) {
        const channel = await notifee.getChannel(channelId);

        if (channel?.blocked) {
            console.log(`Channel ${channelId} is disabled`);
        } else {
            console.log(`Channel ${channelId} is enabled`);
        }
    }

    const createNotificationChannelAndroid = async (props: AndroidChannel) => {
        return await notifee.createChannel({
            badge: true,
            importance: AndroidImportance.HIGH,
            vibration: true,
            ...props,

            id: props.id,
            name: props.name,
        });

    }

    const sendNotification = async (notification: Notification) => {
        console.warn("first sdfsfsdf")
        await notifee.displayNotification({
            android: { channelId: 'default' },
            title: "This is Notification",
            body: "This is body text",
            ...notification
        })
    }

    async function onCreateTriggerNotification() {
        console.log("first")
        const date = new Date(Date.now());
        date.setHours(7);
        date.setMinutes(10);

        console.log("======[date]=====", date.getHours(),date.getMinutes())

        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: date.getTime(),
            repeatFrequency: RepeatFrequency.NONE,
        };

        await notifee.createTriggerNotification(
            {
                id: '123',
                title: 'Meeting with Jane',
                body: 'Today at 11:50am',
                android: {
                    channelId: 'default',
                },
            },
            trigger,
        );
    }


    useEffect(() => {
        requestUserPermission()
    }, [])

    useEffect(() => {
        const subscribe = notifee.onForegroundEvent(({ type, detail }) => {
            switch (type) {
                case EventType.DISMISSED:
                    console.log('User dismissed notification', detail.notification);
                    break;
                case EventType.PRESS:
                    console.log('User pressed notification', detail.notification);
                    break;
            }
        });

        return subscribe

    }, []);

    return {
        sendNotification,
        onCreateTriggerNotification
    }

}