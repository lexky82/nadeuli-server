import { Request, Response } from "express";
import Ruins from "../models/Ruins";
import { Op } from "sequelize";

export const getLocations = async (req: Request, res: Response) => {
  const { minLat, maxLat, minLng, maxLng } = req.query;

  try {
    if (minLat && maxLat && minLng && maxLng) {
      const locations = await Ruins.findAll({
        where: {
          LC_LA: {
            [Op.between]: [minLat, maxLat],
          },
          LC_LO: {
            [Op.between]: [minLng, maxLng],
          },
        },
        attributes: { exclude: ["Summary", "Contents"] },
      });

      const formatLocations = locations.map((location) => ({
        ...location.dataValues,
        position: [
          parseFloat(location.dataValues.LC_LA),
          parseFloat(location.dataValues.LC_LO),
        ],
      }));

      res.status(200).json({ locations: formatLocations });
      return;
    }

    const allLocaitons = await Ruins.findAll({
      attributes: ["ID", "LC_LO", "LC_LA", "POI_NM", "CL_CD"],
    });

    const formatLocations = allLocaitons.map((location) => ({
      id: location.dataValues.ID,
      CL_CD: location.dataValues.CL_CD,
      position: [
        parseFloat(location.dataValues.LC_LA),
        parseFloat(location.dataValues.LC_LO),
      ],
      title: location.dataValues.POI_NM,
    }));

    res.status(200).json({ locations: formatLocations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
};

export const getRuinsInformation = async (req: Request, res: Response) => {
  const { ruinsId } = req.params;

  try {
    const ruins = await Ruins.findByPk(ruinsId);

    if (!ruins) {
      res.status(404).json({ message: "not found ruins" });
      return;
    }

    res.status(200).json({ ruins });
  } catch (error) {
    console.error("Error fetching ruinsInfo:", error);
    res.status(500).json({ error: "Failed to fetch ruinsInfo" });
  }
};

export const autoComplete = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query) {
    res.status(200).json({ message: "not keyword" });
    return;
  }

  try {
    const suggestions = await Ruins.findAll({
      where: {
        POI_NM: {
          [Op.like]: `%${query}%`, // 부분 문자열 매칭
        },
      },
      attributes: [
        "ID",
        "CL_NM",
        "POI_NM",
        "CTPRVN_NM",
        "SIGNGU_NM",
        "LC_LA",
        "LC_LO",
      ],
      limit: 6,
    });

    res.status(200).json({ query, suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
