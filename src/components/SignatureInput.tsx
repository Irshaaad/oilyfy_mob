import React, {useRef, useState} from 'react';
import {Image, Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import {heightToDP} from 'react-native-responsive-screens';
import SignatureCanvas from 'react-native-signature-canvas';
import {ms} from 'react-native-size-matters';
import {useAppSelector} from '../redux/store';
import {COLORS} from '../utils/theme';
import {utility} from '../utils/utility';
import CustomIcon from './common/CustomIcon';
import {TextNormal, TextSmaller} from './common/Texts';

interface SignatureInputInterface {
  value: any;
  onChange: (arg: any) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

const SignatureInput: React.FC<SignatureInputInterface> = props => {
  const {value = '', label, onChange, error, placeholder = 'SIGN_HERE'} = props;
  const isRTL = useAppSelector(store => store.generalSlice.isRTL);

  const [open, setOpen] = useState(false);
  const ref = useRef<any>();

  const handleSignature = (sign: string) => {
    console.log('Signature captured:', sign);
    onChange(sign);
    setOpen(false);
  };

  const handleEmpty = () => {
    console.log('Signature is empty');
  };

  const handleClear = () => {
    console.log('Signature cleared');
    onChange('');
  };

  const handleError = (error: any) => {
    console.error('Signature pad error:', error);
  };

  return (
    <View style={styles.container}>
      <TextNormal>{label}</TextNormal>

      {/* Preview Box */}
      <TouchableOpacity style={styles.preview} onPress={() => setOpen(true)}>
        {value ? (
          <Image
            resizeMode="contain"
            style={{width: '100%', height: '100%'}}
            source={{uri: value}}
          />
        ) : (
          <TextNormal>{placeholder || 'PRESS_TO_OPEN_CANVAS'}</TextNormal>
        )}
      </TouchableOpacity>

      <TextSmaller color={'red'}>{error && `* ${error}`}</TextSmaller>

      {/* Signature Modal */}
      <Modal visible={open} transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
          }}>
          <View
            style={{
              height: '65%',
              maxHeight: 405,
              backgroundColor: 'white',
            }}>
            {/* Header */}
            <View
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                margin: ms(10),
                justifyContent: 'space-between',
              }}>
              <TextNormal bold>{label}</TextNormal>
              <CustomIcon
                name={'cross'}
                type="entypo"
                onPress={() => setOpen(false)}
                size={23}
              />
            </View>
            <View style={{flex: 1, backgroundColor: 'red'}}>
              {/* Signature Pad */}
              <SignatureCanvas
                ref={ref}
                onOK={handleSignature}
                onEmpty={handleEmpty}
                onClear={handleClear}
                onError={handleError}
                autoClear={false}
                dataURL={value}
                clearText={utility.translate('CLEAR')}
                descriptionText={' '}
                confirmText={utility.translate('SAVE')}
                penColor="#000000"
                webviewProps={{
                  cacheEnabled: true,
                  androidLayerType: 'hardware',
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SignatureInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    height: heightToDP(15),
    backgroundColor: COLORS.borderGrey,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightgrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
});
