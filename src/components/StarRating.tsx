import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: number;
    color?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    size = 20,
    color,
}) => {
    const { colors } = useTheme();
    const starColor = color || colors.primary;
    const stars = [];

    for (let i = 1; i <= maxRating; i++) {
        let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'star-outline';
        if (rating >= i) {
            iconName = 'star';
        }
        else if (rating > i - 1 && rating < i) {
            iconName = 'star-half-outline';
        }
        stars.push(
            <Ionicons
                key={i}
                name={iconName}
                size={size}
                color={iconName === 'star-outline' ? colors.border : starColor}
                style={styles.star}
            />
        );
    }

    return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        marginRight: 2,
    },
});

export default StarRating;