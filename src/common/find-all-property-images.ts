import axios from 'axios';

const findAllImages = async (image_id: string) => {
    const images: string[] = [];
    let isNext: boolean = true;
    let counter: number = 0;
    while (isNext) {
        try {
            await axios.get(
                `https://photos.harstatic.com/${image_id}/hr/img-${counter}.jpeg`,
            );
            images.push(
                `https://photos.harstatic.com/${image_id}/hr/img-${counter}.jpeg`,
            );
            counter++;
        } catch (error) {
            isNext = false;
        }
    }
    if (images.length === 0)
        images.push(
            'https://cdn.pixabay.com/photo/2021/01/05/01/15/home-5889366_1280.jpg',
        );
    return images;
};

export default findAllImages;
