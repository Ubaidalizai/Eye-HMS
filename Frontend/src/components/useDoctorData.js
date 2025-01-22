import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../config';

export function useDoctorData(selectedDoctorId, viewType) {
  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);
  const [khataSummary, setKhataSummary] = useState({
    youWillGive: 0,
    youWillGet: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/doctorsHave-percentage`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch doctors');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors.');
    }
  }, []);

  const fetchRecords = useCallback(
    async (doctorId) => {
      try {
        setLoading(true);

        const response = await fetch(
          `${BASE_URL}/khata/doctor-khata/${doctorId}?amountType=${viewType}`,
          { credentials: 'include' }
        );
        if (!response.ok) throw new Error('Failed to fetch records');
        const data = await response.json();
        setRecords(data || []);
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error('Failed to load records.');
      } finally {
        setLoading(false);
      }
    },
    [viewType]
  );

  const fetchDocKhataSummary = useCallback(async (doctorId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/khata/doctor-khata/${doctorId}/summary`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch khata summary');
      const data = await response.json();
      setKhataSummary(data.data);
    } catch (error) {
      console.error('Error fetching khata summary:', error);
      toast.error('Failed to load khata summary.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchRecords(selectedDoctorId);
      fetchDocKhataSummary(selectedDoctorId);
    }
  }, [selectedDoctorId, fetchRecords, fetchDocKhataSummary]);

  return {
    doctors,
    records,
    khataSummary,
    loading,
    fetchRecords,
    fetchDocKhataSummary,
  };
}
