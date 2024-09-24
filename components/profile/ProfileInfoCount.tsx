import { memo } from "react";
import { NavigationProps, User } from "@/types";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/skysolo-ui"
import { useDispatch } from "react-redux";
import { resetProfileFollowList } from "@/redux-stores/slice/profile";


const ProfileInfoCount = memo(function ProfileInfoCount({
    navigation,
    userData,
    isProfile
}: {
    navigation: NavigationProps,
    userData: User | null,
    isProfile: boolean
}) {
    const dispatch = useDispatch()
    const counts = [
        { title: "Posts", count: userData?.postCount, onPress: () => { } },
        {
            title: "Followers", count: userData?.followerCount, onPress: () => {
                dispatch(resetProfileFollowList())
                navigation.navigate('profile/followersAndFollowing', {
                    screen: 'followers',
                    params: { username: userData?.username }
                })
            }
        },
        {
            title: "Following", count: userData?.followingCount, onPress: () => {
                dispatch(resetProfileFollowList())
                navigation.navigate('profile/followersAndFollowing', {
                    screen: 'following',
                    params: { username: userData?.username }
                })
            }
        }
    ]

    return (<View style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    }}>
        {counts.map((item, index) => (
            <TouchableOpacity key={index} style={{ alignItems: 'center' }} onPress={item.onPress} activeOpacity={0.8}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.count}</Text>
                <Text variant="heading4" colorVariant="secondary">{item.title}</Text>
            </TouchableOpacity>
        ))}
    </View>)
})
export default ProfileInfoCount;