import { BaseController } from "./BaseController.ts";

export class ProfileController extends BaseController {
  async getProfile(): Promise<Response> {
    try {
      const profileData = await Deno.readTextFile("./api/profile.json");
      return new Response(profileData, {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=3600", // Cache for 1 hour
          "x-robots-tag": "index, follow",
          "x-hiring-status": "available",
          "x-experience-level": "3+ years",
          "x-primary-skills": "React, Node.js, TypeScript",
        },
      });
    } catch (error) {
      console.error("Error reading profile data:", error);
      return this.sendError("Internal Server Error", 500);
    }
  }

  async getHiringProfile(): Promise<Response> {
    try {
      const hiringData = await Deno.readTextFile("./api/hiring.json");
      return new Response(hiringData, {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=1800", // Cache for 30 minutes (more frequent updates for hiring data)
          "x-robots-tag": "index, follow",
          "x-hiring-status": "actively-seeking",
          "x-availability": "immediate",
          "x-remote-work": "yes",
          "x-experience-level": "senior",
          "x-years-experience": "3",
          "x-primary-technologies": "React,Node.js,TypeScript,JavaScript,AWS",
          "x-location": "Ho Chi Minh City, Vietnam",
          "x-timezone": "GMT+7",
        },
      });
    } catch (error) {
      console.error("Error reading hiring data:", error);
      return this.sendError("Internal Server Error", 500);
    }
  }
}
