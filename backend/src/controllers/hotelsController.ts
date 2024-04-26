import { Request, Response } from 'express';
import Hotel from '../models/hotel';
import { HotelSearchResponse } from '../shared/types';
import { validationResult } from 'express-validator';
import {
  updateHotelFacilities,
  updateHotelStartingPrice,
} from './myHotelController';

export const getAllHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({ deleted_at: { $in: [null, undefined] } })
      .sort('-createdAt')
      .populate('review')
      .populate('bookings');
    res.json(hotels);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: 'Error fetching hotels' });
  }
};

export const getHotelById = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const hotelId = req.params.id.toString();

  try {
    const hotel = await Hotel.findOne({
      _id: hotelId,
      deleted_at: { $in: [null, undefined] },
    })
      .populate('review')
      .populate('bookings');
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.deleted_at) {
      return res.status(404).json({ message: 'Hotel has been deleted or removed!' });
    }

    res.json(hotel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching hotel' });
  }
};

export const createHotel = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newHotel = new Hotel(req.body);
    if (req.userId) {
      newHotel.userId = req.userId;
    } else {
      return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    }

    const savedHotel = await newHotel.save();
    res.status(201).json(savedHotel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating hotel' });
  }
};

export const updateHotel = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const hotelId = req.params.id;

  try {
    const updatedHotel = await Hotel.findOneAndUpdate(
      {
        _id: hotelId,
        userId: req.userId,
        deleted_at: { $in: [null, undefined] },
      },
      req.body,
      { new: true }
    );

    if (!updatedHotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    try {
      await updateHotelFacilities(req.params.hotelId);
      await updateHotelStartingPrice(req.params.hotelId);
    } catch (err) {
      res.status(500).json({
        message: 'Something went wrong, cannot update hotel facilities',
      });
    }

    res.json(updatedHotel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error updating hotel' });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  const hotelId = req.params.id;

  try {
    const deletedHotel = await Hotel.findOneAndUpdate(
      {
        _id: hotelId,
        userId: req.userId,
        deleted_at: { $in: [null, undefined] },
      },
      { deleted_at: new Date() },
      { new: true }
    );

    if (!deletedHotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error deleting hotel' });
  }
};

export const searchHotels = async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);
    console.log(req.query);
    console.log(query);

    let sortOptions = {};
    switch (req.query.sortOption) {
      case 'starRating':
        sortOptions = { starRating: -1 };
        break;
      case 'startingPriceAsc':
        sortOptions = { startingPrice: 1 };
        break;
      case 'startingPriceDesc':
        sortOptions = { startingPrice: -1 };
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : '1'
    );
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log('error', error);
    res
      .status(500)
      .json({ message: 'Something went wrong, please try searching again' });
  }
};

export const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {
    deleted_at: { $in: [null, undefined] },
  };

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, 'i') },
      { country: new RegExp(queryParams.destination, 'i') },
    ];
  }

  if (queryParams.allFacilities) {
    constructedQuery.allFacilities = {
      $all: Array.isArray(queryParams.allFacilities)
        ? queryParams.allFacilities
        : [queryParams.allFacilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.startingPrice) {
    constructedQuery.startingPrice = {
      $lte: parseInt(queryParams.startingPrice),
    };
  }

  return constructedQuery;
};
