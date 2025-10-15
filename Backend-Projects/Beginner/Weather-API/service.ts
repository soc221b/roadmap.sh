import { IService } from "./interface.ts";
import z from "zod/v4";

export class Service extends IService {
  async get(location: string): Promise<unknown> {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=us&include=current&key=${process.env.VISUAL_CROSSING_WEB_SERVICES_KEY}&contentType=json`
    );
    const data = await response.json();
    const schema = z.object({
      days: z.array(
        z.object({
          datetime: z.iso.date(),
          temp: z.number(),
        })
      ),
    });
    return schema
      .parse(data)
      .days.find(
        (day) => day.datetime === new Date().toISOString().split("T")[0]
      );
  }
}
