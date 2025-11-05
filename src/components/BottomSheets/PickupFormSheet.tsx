import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
// import {createReadStream} from 'fs';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useUpdateScheduleMutation } from '../../redux/apis/schedules';
import { setCurrentTrips } from '../../redux/reducers/generalSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { API_URL, BASE_URL } from '../../utils/constants';
import { handleErrorMessage, showSuccessToast } from '../../utils/helpers';
import { Schedule } from '../../utils/interface';
import { utility } from '../../utils/utility';
import BottomViewWrapper from '../common/BottomViewWrapper';
import CustomButton from '../common/CustomButton';
import Checkbox from '../common/CustomCheckBox';
import Fields, { Field } from '../common/Fields';
import { TextBig, TextNormal } from '../common/Texts';
import moment from "moment";
import { useTranslation } from 'react-i18next';
import { useUploadVideoMutation } from '../../redux/apis/auth';
import { COLORS } from '../../utils/theme';
interface PickupFormSheetProps {
  schedule: Schedule;
  closeSheet: () => void;
  handleUpdateStatus?: () => void;
  isOpen: boolean;
  bottomSheetRef?: React.RefObject<BottomSheetModal>;
  isSingleTrip?: boolean;
}

export const PickupFormSheet: React.FC<PickupFormSheetProps> = React.memo(
  props => {
    const {
      schedule,
      isOpen,
      closeSheet,
      handleUpdateStatus,
      bottomSheetRef,
      isSingleTrip = false,
    } = props;
    const accessToken = useAppSelector(store => store.generalSlice.accessToken);
    const { control, handleSubmit, reset } = useForm();
    const { t } = useTranslation()

    const [uploadVideo, { isLoading: uploadVideoLoader }] = useUploadVideoMutation()

    const onClose = () => {
      closeSheet();
      reset();
    };

    const dispatch = useAppDispatch();
    const currentActiveTrips = useAppSelector(
      store => store.generalSlice.currentTripList,
    );

    const [updateSchedule, { isLoading }] = useUpdateScheduleMutation();
    const [uploadLoading, setUploadLoading] = useState(false);

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
          const call = await ReactNativeBlobUtil.fetch(
            'POST',
            `${API_URL}uploads?upload_type=1&route_type=2&schedule_id=${schedule.id}`,
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
      const schedule_ids = schedule.id
      try {
        for (const element of videos) {
          const formData = new FormData()
          formData.append('videos', element)
          const response = await uploadVideo({ schedule_ids, formData })
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
        console.log("=========SIGNATURE========")
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const fileName = `upload_${Date.now() + 33}.png`;
        const call = await ReactNativeBlobUtil.fetch(
          'POST',
          `${API_URL}uploads?upload_type=1&route_type=2&schedule_id=${schedule.id}`,
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
          throw new Error('Error uploading images');
        }

        setUploadLoading(false);

        return response?.result[0];
      } catch (error) {
        console.log("-=================[ERROR UPLOADING SIGNATURE]-=================", error)
        handleErrorMessage(error);
        setUploadLoading(false);
      }
    };

    const onPickupOrder = async (data: any) => {
      try {
        const body = {
          ...data,
          id: schedule.id,
          time: new Date().toISOString(),
          status: 'IN_PROGRESS',
          attachments: [],
        };

        const images = data?.attachments?.length
          ? await handleImageUpload(data?.attachments)
          : [];

        const videos = data?.attachments_video?.length
          ? await handleVideoUpload(data?.attachments_video)
          : [];

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

        body.signature = `${BASE_URL}${signatureImage?.path}`;

        delete body.date;
        delete body.attachments_video


        console.log('===body===>', JSON.stringify(body, null, 1));

        const res = await updateSchedule(body).unwrap();
        console.log("======[res]=====", JSON.stringify(res, null, 1))
        showSuccessToast('Schedule updated successfully');
        closeSheet();

        if (isSingleTrip) {
          setTimeout(() => {
            utility.navigation?.goBack();
          }, 500);
        }

        // only when start trip for all schedules
        if (!isSingleTrip && currentActiveTrips.length) {
          const copyTripList = currentActiveTrips;
          const currentScheduleIndex = copyTripList.findIndex(
            i => i.id === schedule.id,
          );

          if (currentScheduleIndex < 0) {
            return null;
          }

          const currentSchedule = copyTripList[currentScheduleIndex];

          let filtered = copyTripList.filter(i => i.id !== currentSchedule.id);

          filtered = [
            ...filtered,
            {
              ...currentSchedule,
              status: 'IN_PROGRESS',
              expected_volume: data?.oil_collected,
              oil_collected: data?.oil_collected,
            },
          ];

          dispatch(setCurrentTrips(filtered));
          handleUpdateStatus && handleUpdateStatus()
        }
      } catch (error) {
        handleErrorMessage(error);
      }
    };

    const FIELDS: Field[] = [
      {
        id: '1',
        name: 'date',
        type: 'date',
        label: 'DATE',
        defaultValue: moment(schedule?.date, "YYYY-MM-DD HH:mm:ss.SSS Z").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        disabled: true,
        placeholder: 'SELECT_DATE',
        // rules: { required: { value: true, message: utility.translate("THIS_IS_REQUIRED") } }
      },
      // {
      //   id: '2',
      //   name: 'time',
      //   type: 'time',
      //   // disabled: true,
      //   // defaultValue: schedule?.time,
      //   // defaultValue: schedule?.date,

      //   label: 'TIME',
      //   placeholder: 'SELECT_TIME',
      //   rules: {
      //     required: {
      //       value: false,
      //       message: utility.translate('THIS_IS_REQUIRED'),
      //     },
      //   },
      // },
      {
        id: '3',
        name: 'oil_collected',
        type: 'text',
        label: 'OIL_COLLECTED',
        placeholder: 'TYPE_HERE',
        rules: {
          required: {
            value: true,
            message: utility.translate('THIS_IS_REQUIRED'),
          },
        },
        suffix: t("LITRE"),
        keyboardType: 'numeric',
      },
      {
        id: '4',
        name: 'signature',
        type: 'signature',
        label: 'SIGNATURE',
        rules: {
          required: {
            value: true,
            message: utility.translate('THIS_IS_REQUIRED'),
          },
        },
        placeholder: 'SIGNATURE_HERE',
      },
      {
        id: '5',
        name: 'attachments',
        type: 'image-picker',
        label: 'UPLOAD_IMAGES',
        rules: {
          required: {
            value: true,
            message: utility.translate('THIS_IS_REQUIRED'),
          },
        },
        placeholder: 'CAPTURE_UPLOAD_IMAGES',
      },
      {
        id: '6',
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
        isVisible={isOpen}
        closeSheet={onClose}
        bottomSheetRef={bottomSheetRef}>
        <View style={styles.container}>
          <TextBig center numberOfLines={1} textStyle={{ backgroundColor: COLORS.primary, padding: 5, paddingLeft: 10, borderRadius: 8 }} color={"white"} bold>{schedule?.branch?.name || "NO_BRANCH_NAME"} </TextBig>
          <View style={styles.header}>
            <TextNormal>PICKUP_SCREEN</TextNormal>
          </View>
          <View style={styles.contentContainer}>
            <Fields control={control} fields={FIELDS} />
          </View>

          <Controller
            control={control}
            name="collected_oil_sample"
            render={({ field: { value, onChange } }) => (
              <View style={{ marginTop: 13 }}>
                <Checkbox
                  text={'COLLECTED_SAMPLE_FOR_OIL'}
                  value={value}
                  onChange={onChange}
                />
              </View>
            )}
          />

          <View style={styles.btnContainer}>
            {/* <CustomButton
              title="NAVIGATE"
              width={'48%'}
              tirtiary
              onPress={() => {
                closeSheet();
                setTimeout(() => {
                  utility.navigation?.navigate('ViewLocation');
                }, 100);
              }}
              disabled={isLoading || uploadLoading}
            /> */}
            <CustomButton
              title="PICKUP"
              width={'100%'}
              loading={isLoading || uploadLoading}
              onPress={handleSubmit(onPickupOrder)}
            />
          </View>
        </View>
      </BottomViewWrapper>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    // height: '70%',
    // maxHeight: 225,
    // backgroundColor: 'grey',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  contentContainer: {
    // justifyContent: 'space-between',
    // flex: 1,
    // backgroundColor: 'red',
    gap: 2,
    // paddingVertical: heightToDP(2)
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: 'pink',
  },
});
