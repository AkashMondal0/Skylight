import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
// import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import z from "zod"
import { RootState } from '@/redux-stores/store';
import { Button, Icon, Input, Text } from '@/components/skysolo-ui';

const schema = z.object({
    email: z.string().email({ message: "Invalid email" })
        .nonempty({ message: "Email is required" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" })
        .nonempty({ message: "Password is required" }),
    name: z.string().nonempty({ message: "Name is required" }),
    username: z.string().nonempty({ message: "Username is required" }),
})

const RegisterScreen = ({ navigation }: any) => {
    const Session = useSelector((state: RootState) => state.AuthState)
    const [state, setStats] = React.useState({
        showPassword: false,
    });
    const dispatch = useDispatch()

    const { control, watch, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: '',
            name: '',
            username: '',
        },
        resolver: zodResolver(schema)
    });

    const handleLogin = useCallback(async (data: {
        email: string,
        password: string,
    }) => {
        // const _data = await dispatch(loginApi({
        //     email: data.email,
        //     password: data.password,
        // }) as any)
    }, [])

    return (
        <View style={{
            flex: 1,
            padding: 20,
            width: "100%",
        }}>
            <Icon
                iconName="ArrowLeft"
                size={30}
                onPress={() => navigation.goBack()}
                isButton />
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Text style={{
                    fontSize: 32,
                    fontWeight: '700',
                    textAlign: 'center',
                }}>
                    Create an account
                </Text>
                <Text
                    style={{
                        fontSize: 15,
                        marginBottom: 40,
                        marginHorizontal: 25,
                        textAlign: "center"
                    }}>
                    Create an account to get all features
                </Text>
                <Input
                    style={{
                        width: "90%"
                    }}
                    placeholder='Name'
                    textContentType='name'
                    keyboardType="default"
                    returnKeyType="next" />
                <Text
                    colorVariant="danger"
                    style={{
                        fontSize: 12,
                        textAlign: "left",
                        fontWeight: 'bold',
                        margin: 4,
                    }}>
                    {errors.name?.message}
                </Text>
                <Input
                    style={{
                        width: "90%"
                    }}
                    placeholder='Username'
                    textContentType="username"
                    keyboardType="default"
                    returnKeyType="next" />
                <Text
                    colorVariant="danger"
                    style={{
                        fontSize: 12,
                        textAlign: "left",
                        fontWeight: 'bold',
                        margin: 4,
                    }}>
                    {errors.username?.message}
                </Text>
                <Input
                    style={{
                        width: "90%"
                    }}
                    placeholder='Email'
                    textContentType='emailAddress'
                    keyboardType="email-address"
                    returnKeyType="next" />
                <Text
                    colorVariant="danger"
                    style={{
                        fontSize: 12,
                        textAlign: "left",
                        fontWeight: 'bold',
                        margin: 4,
                    }}>
                    {errors.email?.message}
                </Text>

                <Input
                    style={{
                        width: "90%"
                    }}
                    secureTextEntry={!state.showPassword}
                    placeholder='Password'
                    textContentType='password'
                    returnKeyType="done"
                    rightSideComponent={state.showPassword ? <Icon iconName="Eye" size={26} onPress={() => setStats({ ...state, showPassword: false })} /> :
                        <Icon iconName="EyeOff" size={26} onPress={() => setStats({ ...state, showPassword: true })} />} />
                <Text
                    colorVariant="danger"
                    style={{
                        fontSize: 12,
                        textAlign: "left",
                        fontWeight: 'bold',
                        margin: 4,
                    }}>
                    {errors.password?.message}
                </Text>

                <Button onPress={handleSubmit(handleLogin)} style={{
                    width: "90%",
                    marginVertical: 20,
                }}>
                    Register
                </Button>
            </View>
        </View>
    );
};



export default RegisterScreen;