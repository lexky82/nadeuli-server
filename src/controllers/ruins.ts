import { Request, Response } from "express";
import Ruins from "../models/Ruins";
import { Op } from "sequelize";

export const getLocations = async (req: Request, res: Response) => {
  const { minLat, maxLat, minLng, maxLng } = req.query;

  try {
    const locations = await Ruins.findAll({
      attributes: ["LC_LO", "LC_LA", "POI_NM"],
      where: {
        LC_LA: {
          [Op.between]: [minLat, maxLat],
        },
        LC_LO: {
          [Op.between]: [minLng, maxLng],
        },
      },
    });

    res.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
};

// export const getRuinsInfo = async (req: Request, res: Response) => {

//   res.status(200).json({ ruins });
// };
