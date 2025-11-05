/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { heightToDP } from 'react-native-responsive-screens';
import {
  useUpdateMultipleScheduleMutation,
  useUpdateScheduleMutation,
} from '../../redux/apis/schedules';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { API_URL, BASE_URL } from '../../utils/constants';
import { handleErrorMessage, showSuccessToast } from '../../utils/helpers';
import { Schedule } from '../../utils/interface';
import { COLORS } from '../../utils/theme';
import { utility } from '../../utils/utility';
import BottomViewWrapper from '../common/BottomViewWrapper';
import CustomButton from '../common/CustomButton';
import Fields, { Field } from '../common/Fields';
import { TextNormal } from '../common/Texts';
import {
  setCurrentTrips,
  setTripActive,
} from '../../redux/reducers/generalSlice';
import { useTranslation } from 'react-i18next';
import { useUploadVideoMutation } from '../../redux/apis/auth';

interface EndTripFormSheetProps {
  isOpen: boolean;
  closeSheet: () => void;
  schedule: Schedule;
  schedules?: Schedule[];
  isMultipleSchedules: boolean;
}

export const EndTripFormSheet: React.FC<EndTripFormSheetProps> = React.memo(
  props => {
    const {
      closeSheet,
      isOpen,
      schedule,
      isMultipleSchedules = false,
      schedules = [],
    } = props;

    const { control, handleSubmit } = useForm();
    const dispatch = useAppDispatch();

    const accessToken = useAppSelector(store => store.generalSlice.accessToken);
    const isRTL = useAppSelector(store => store.generalSlice.isRTL);
    const styles = dynamicStyles(!!isRTL);

    const [uploadVideo, { isLoading: uploadVideoLoader }] = useUploadVideoMutation()

    const [uploadLoading, setUploadLoading] = useState(false);
    const [updateSchedule, { isLoading }] = useUpdateScheduleMutation();
    const [updateMultipleSchedule, { isLoading: multipleLoading }] =
      useUpdateMultipleScheduleMutation();

    const handleImageUpload = async (images: any[]) => {
      const result = [];
      setUploadLoading(true);
      try {
        for (const element of images) {
          const base64Data = element.base64.replace(
            /^data:image\/\w+;base64,/,
            '',
          );
          const fileName = `upload_${Date.now()}.png`;
          let endpoint = `${API_URL}uploads?upload_type=1&route_type=2&schedule_id=${isMultipleSchedules ? schedules[0]?.id : schedule.id
            }`;

          console.log('===endpoint===>', JSON.stringify(endpoint, null, 1));

          const call = await ReactNativeBlobUtil.fetch(
            'POST',
            endpoint,
            {
              Authorization: `${accessToken}`, // Don't set Content-Type manually
            },
            [
              {
                name: 'images', // This should match your server field name
                filename: fileName,
                type: 'image/png',
                data: base64Data, // this must be raw base64 data without prefix
              },
            ],
          );
          const response = JSON.parse(call.data);

          if (!response?.success) {
            console.log('ERROR UPLOAD', JSON.stringify(response, null, 1));
            throw new Error('Error uploading images');
          }
          result.push(response?.result[0]);
        }
        setUploadLoading(false);
        return result;
      } catch (error) {
        handleErrorMessage(error);
        setUploadLoading(false);
      }
    };

    const handleVideoUpload = async (videos: any[]) => {
      const result = [];
      setUploadLoading(true);
      const schedule_id = isMultipleSchedules ? schedules[0]?.id : schedule.id
      try {
        for (const element of videos) {
          const formData = new FormData()
          formData.append('videos', element)
          const response = await uploadVideo({ schedule_id, formData })
          console.log("======[VIDEO RESPONSE]=====", JSON.stringify(response.data, null, 1))
          result.push(response.data?.result[0]);
        }
        setUploadLoading(false);
        return result;
      } catch (error) {
        handleErrorMessage(error);
        setUploadLoading(false);
      }
    };

    const handleSignatureImageUpload = async image => {
      setUploadLoading(true);
      try {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const fileName = `upload_${Date.now() + 33}.png`;
        let endpoint = `${API_URL}uploads?upload_type=1&route_type=2&schedule_id=${isMultipleSchedules ? schedules[0]?.id : schedule.id}`;
        console.log('===endpoint===>', JSON.stringify(endpoint, null, 1));
        const call = await ReactNativeBlobUtil.fetch(
          'POST',
          endpoint,
          {
            Authorization: `${accessToken} `, // Don't set Content-Type manually
          },
          [
            {
              name: 'images', // This should match your server field name
              filename: fileName,
              type: 'image/png',
              data: base64Data, // this must be raw base64 data without prefix
            },
          ],
        );
        const response = JSON.parse(call.data);

        if (!response?.success) {
          throw new Error('Error uploading images');
        }

        setUploadLoading(false);

        return response?.result[0];
      } catch (error) {
        handleErrorMessage(error);
        setUploadLoading(false);
      }
    };

    const { t } = useTranslation()

    const onSubmitForm = async (data: any) => {
      try {
        const body = {
          ...data,
          status: 'COMPLETED',
          time: new Date()?.toISOString(),
          attachments: []
        };
        console.log(
          '===isMultipleSchedules===>',
          JSON.stringify(schedules, null, 1),
        );

        body.schedule_ids = isMultipleSchedules
          ? schedules.map(it => it.id)
          : [schedule.id];

        const images = data?.attachments?.length
          ? await handleImageUpload(data?.attachments)
          : [];

        const videos = data?.attachments_video?.length
          ? await handleVideoUpload(data?.attachments_video)
          : [];

        console.log('===images===>', JSON.stringify(images, null, 1));

        if (images?.length) {
          body.attachments = [...body.attachments, ...images?.map(img => ({
            file_name: img?.fileName,
            url: `${BASE_URL}${img?.path} `,
            attachment_type: 'SCHEDULE',
          }))];
        }

        if (videos?.length) {
          body.attachments = [...body.attachments, ...videos?.map(img => ({
            file_name: img?.fileName,
            url: `${BASE_URL}${img?.path} `,
            attachment_type: 'SCHEDULE_VIDEO',
          }))];
        }

        const signatureImage = await handleSignatureImageUpload(
          data?.signature,
        );

        console.log(
          '===signatureImage===>',
          JSON.stringify(signatureImage, null, 1),
        );

        body.signature = `${BASE_URL}${signatureImage?.path} `;

        delete body.attachments_video

        console.log('===body===>', JSON.stringify(body, null, 1));

        // if (isMultipleSchedules) {
        const multiresponse = await updateMultipleSchedule(body).unwrap();
        console.log(
          '===multiresponse===>',
          JSON.stringify(multiresponse, null, 1),
        );

        dispatch(setTripActive(false));
        dispatch(setCurrentTrips([]));
        // } else {
        //   const response = await updateSchedule(body).unwrap();
        //   console.log('===response===>', JSON.stringify(response, null, 1));
        // }

        showSuccessToast('Schedule updated successfully');
        closeSheet();

        setTimeout(() => {
          utility.navigation?.goBack();
        }, 400);
      } catch (error) {
        handleErrorMessage(error);
      }
    };


    const FIELD3: Field[] = [
      {
        id: '1',
        name: 'total_pickups',
        type: 'text',
        label: 'TOTAL_OIL_PICKUPS',
        keyboardType: 'numeric',
        editable: false,
        defaultValue: isMultipleSchedules ? `${schedules.length} ` : '1',
        placeholder: 'TYPE_HERE',
        containerStyle: { width: '45%' },
        rules: {
          required: {
            value: true,
            message: utility.translate('THIS_IS_REQUIRED'),
          },
        },
      },
      {
        id: '2',
        name: 'total_oil_cans',
        type: 'text',
        label: 'TOTAL_NUMBER_OIL_CANS',
        keyboardType: 'numeric',
        suffix: t("CANS"),
        // editable: false,
        defaultValue: isMultipleSchedules
          ? schedules.reduce((total, item) => {
            const count =
              Number(item?.no_of_cans) || Number(item?.oil_collected) || 0; // ensure it's a number
            return `${total + count} `;
          }, 0)
          : `${schedule?.no_of_cans || Number(schedule?.oil_collected) || 0} `,
        placeholder: 'SELECT_TIME',
        containerStyle: { width: '50%' },
        rules: {
          required: {
            value: true,
            message: utility.translate('THIS_IS_REQUIRED'),
          },
        },
      },
    ];

    const FIELDS: Field[] = [
      {
        id: '3',
        name: 'oil_collected',
        type: 'text',
        suffix: t("LITRE"),
        editable: false,
        label: 'TOTAL_NUMBER_OF_OIL_VOLUME',
        defaultValue: isMultipleSchedules
          ? schedules.reduce((total, item) => {
            const count =
              Number(item?.oil_collected || item?.expected_volume) || 0; // ensure it's a number
            return `${total + count} `;
          }, 0)
          : `${schedule?.oil_collected || schedule?.expected_volume || 0} `,
        rules: {
          required: {
            value: true,
            message: utility.translate('THIS_IS_REQUIRED'),
          },
        },
        placeholder: 'TYPE_HERE',
        keyboardType: 'numeric',
      },
    ];

    const FIELDS_2 = [
      {
        id: '6',
        name: 'manager_name',
        type: 'text',
        label: 'MANAGER_NAME',
        placeholder: 'TYPE_HERE',
        rules: {
          required: {
            value: true,
            message: utility.translate('THIS_IS_REQUIRED'),
          },
        },
      },
      {
        id: '4',
        name: 'signature',
        type: 'signature',
        label: 'SIGNATURE',
        placeholder: 'SIGNATURE_HERE',
        rules: {
          required: {
            value: true,
            message: utility.translate('THIS_IS_REQUIRED'),
          },
        },
      },
      {
        id: '5',
        name: 'attachments',
        type: 'image-picker',
        label: 'UPLOAD_IMAGES',
        placeholder: 'CAPTURE_UPLOAD_IMAGES',
        rules: {
          required: {
            value: true,
            message: utility.translate('THIS_IS_REQUIRED'),
          },
        },
      },
      {
        id: '9',
        name: 'attachments_video',
        type: 'video-picker',
        label: 'UPLOAD_VIDEO',
        placeholder: 'UPLOAD_VIDEO',
        rules: {
          required: {
            value: true,
            message: utility.translate('THIS_IS_REQUIRED'),
          },
        },
      },
    ];

    return (
      <BottomViewWrapper
        closeSheet={closeSheet}
        isVisible={isOpen}
        allowDragToClose={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TextNormal bold>DROP_OFF_OIL_CAN</TextNormal>
          </View>
          <View style={styles.contentContainer}>
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                justifyContent: 'space-between',
              }}>
              <Fields control={control} fields={FIELD3} />
            </View>
            <Fields control={control} fields={FIELDS} />
            <Fields control={control} fields={FIELDS_2} />
          </View>

          <View style={styles.btnContainer}>
            <CustomButton
              title="CLOSE"
              width={'48%'}
              tirtiary
              disabled={uploadLoading || isLoading || multipleLoading}
              onPress={closeSheet}
            />
            <CustomButton
              title="COMPLETE"
              width={'48%'}
              loading={uploadLoading || isLoading || multipleLoading}
              onPress={handleSubmit(onSubmitForm)}
            />
          </View>
        </View>
      </BottomViewWrapper>
    );
  },
);

const dynamicStyles = (isRTL: boolean) =>
  StyleSheet.create({
    container: {
      // height: '60%',
      gap: 16,
    },
    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 5,
    },
    contentContainer: {
      // justifyContent: 'space-between',
      // flex: 1,
      gap: 2,
      // paddingVertical: heightToDP(2)
    },
    sendReportButton: {
      backgroundColor: COLORS.blue,
      marginBottom: heightToDP(11),
    },
    collectTube: {
      borderColor: COLORS.red,
      borderWidth: 1,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      flexDirection: 'row',
      height: heightToDP(5),
      backgroundColor: '#FFE5E5',
    },
    btnContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 20,
      // flex: 0.3,
      // height: '30%',
      // backgroundColor: 'red',
      // alignSelf: 'baseline',
    },
  });
