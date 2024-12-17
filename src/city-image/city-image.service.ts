import { Injectable } from '@nestjs/common';
import { CreateCityImageDto } from './dto/create-city-image.dto';
import { DataSource } from 'typeorm';
import { IGenericResult } from 'src/common/interfaces';

@Injectable()
export class CityImageService {

  constructor(
    private readonly dataSource: DataSource
  ) {}

  async create(createCityImageDto: CreateCityImageDto): Promise<IGenericResult> {
    try {

      const newCity = createCityImageDto.city.toLowerCase();

      const foundCityImage = (await this.dataSource.query(`
        SELECT * FROM city_image_mapping WHERE city = ?
        `, [newCity]))[0]

      if (foundCityImage) {
        await this.dataSource.query(`
            UPDATE city_image_mapping SET imageUrl = ? WHERE city = ?
            `, [createCityImageDto.image_url, newCity])
      } else {
        await this.dataSource.query(`
              INSERT INTO city_image_mapping (city, imageUrl) VALUES (?, ?)
              `, [newCity, createCityImageDto.image_url])
      }

    } catch (error) {
      if (error?.code === 'ER_DUP_ENTRY') {
        return {
          message: 'City image already exists, or associated with different city please try again with diff url'
        }
      }
      throw error;
    }
    return {
      message: 'City image data updated'
    }
  }

  async findOne(id: string): Promise<IGenericResult> {
    const foundCityImage = await this.dataSource.query(`
      SELECT * FROM city_image_mapping WHERE city = ?
      `, [id.toLowerCase()])

    return {
      message: 'City image found',
      data: {
        city_image: foundCityImage[0]?.imageUrl || '',
      }
    };
  }
}
