import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse, IAddVolunteerPayload, IOrganisationVolunteer } from "@/types";

/**
 * Add a new volunteer to the organisation.
 */
export const addVolunteer = async (payload: IAddVolunteerPayload) => {
  const response = await axiosInstance.post<ApiResponse<IOrganisationVolunteer>>(
    "/organisations/volunteers",
    payload
  );
  return response.data;
};

/**
 * Fetch all volunteers for the current organisation.
 */
export const getVolunteers = async () => {
  const response = await axiosInstance.get<ApiResponse<IOrganisationVolunteer[]>>(
    "/organisations/volunteers"
  );
  return response.data;
};

/**
 * Update the last donation date of a volunteer by their blood donor ID.
 * Only applicable for volunteers not registered as platform users.
 */
export const updateVolunteerDonationDate = async (
  bloodDonorId: string,
  payload: { donationDate: string }
) => {
  const response = await axiosInstance.patch<ApiResponse<null>>(
    `/organisations/volunteers/${bloodDonorId}/donation-date`,
    payload
  );
  return response.data;
};

/**
 * Remove a volunteer from the organisation.
 */
export const deleteVolunteer = async (bloodDonorId: string) => {
  const response = await axiosInstance.delete<ApiResponse<null>>(
    `/organisations/volunteers/${bloodDonorId}`
  );
  return response.data;
};

/**
 * Update a volunteer's information (manual entry only).
 */
export const updateVolunteerInfo = async (
  bloodDonorId: string,
  payload: Partial<IAddVolunteerPayload>
) => {
  const response = await axiosInstance.patch<ApiResponse<null>>(
    `/organisations/volunteers/${bloodDonorId}`,
    payload
  );
  return response.data;
};
