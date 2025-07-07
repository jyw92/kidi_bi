const APP_FINANCE = 'APP_FINANCE';
const APP_LIFE = 'APP_LIFE';
const APP_SHOPPING = 'APP_SHOPPING';
const APP_LEISURE = 'APP_LEISURE';
const APP_INFO = 'APP_INFO';
const APP_COMMU = 'APP_COMMU';
const CARD_LIFESERVI = 'CARD_LIFESERVI';
const CARD_TRAFFIC = 'CARD_TRAFFIC';
const CARD_SHOPPING = 'CARD_SHOPPING';
const CARD_LEISURE = 'CARD_LEISURE';
const CARD_FOOD = 'CARD_FOOD';

const categoryIdToName = (categoryID) => {
    switch (categoryID) {
        case APP_FINANCE:
            return '금융';
        case APP_LIFE:
            return '생활';
        case APP_SHOPPING:
            return '쇼핑';
        case APP_LEISURE:
            return '레저&엔터';
        case APP_INFO:
            return '정보';
        case APP_COMMU:
            return '커뮤니티';
        case CARD_LIFESERVI:
            return '생활서비스';
        case CARD_TRAFFIC:
            return '교통';
        case CARD_SHOPPING:
            return '쇼핑';
        case CARD_LEISURE:
            return '레저·여행·유흥';
        case CARD_FOOD:
            return '외식·식음료'
        default:
            return 'Unknown Category';
    }
}


export default categoryIdToName;