'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../config';

export function useDoctorData(
  selectedDoctorId,
  viewType,
  initialPage = 1,
  initialLimit = 10
) {
  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);
  const [khataSummary, setKhataSummary] = useState({
    youWillGive: 0,
    youWillGet: 0,
  });
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);

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
    async (
      doctorId,
      pageToFetch = currentPage,
      limitToFetch = itemsPerPage
    ) => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/khata/doctor-khata/${doctorId}?amountType=${viewType}&page=${pageToFetch}&limit=${limitToFetch}`,
          { credentials: 'include' }
        );

        if (!response.ok) throw new Error('Failed to fetch records');
        const data = await response.json();

        // Extract records from the response based on the backend structure
        if (data.results) {
          // Backend returns { results: [...], totalResults: number, totalPages: number }
          setRecords(data.results);
          setTotalItems(data.totalResults || 0);
          setTotalPages(data.totalPages || 1);

          // Update the current page to match what the backend returned
          // This is important for keeping UI in sync with actual data
          if (data.currentPage !== undefined) {
            setCurrentPage(Number(data.currentPage));
          } else {
            setCurrentPage(pageToFetch);
          }
        } else {
          // Fallback if response structure is different
          setRecords(Array.isArray(data) ? data : []);
          setTotalItems(Array.isArray(data) ? data.length : 0);
          setTotalPages(
            Math.ceil((Array.isArray(data) ? data.length : 0) / limitToFetch)
          );
          setCurrentPage(pageToFetch);
        }
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error('Failed to load records.');
        // Set records to empty array on error to prevent further issues
        setRecords([]);
      } finally {
        setLoading(false);
      }
    },
    [viewType, itemsPerPage] // Remove currentPage from dependencies
  );

  const fetchDocKhataSummary = useCallback(async (doctorId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/khata/doctor-khata/summary?id=${doctorId}`,
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

  // Handle page change
  const handlePageChange = useCallback(
    (newPage) => {
      if (selectedDoctorId) {
        // Always fetch records for the requested page
        fetchRecords(selectedDoctorId, newPage, itemsPerPage);
      }
    },
    [selectedDoctorId, fetchRecords, itemsPerPage, currentPage]
  );

  // Handle items per page change
  const handleItemsPerPageChange = useCallback(
    (newLimit) => {
      setItemsPerPage(newLimit);
      if (selectedDoctorId) {
        // Always start from page 1 when changing items per page
        fetchRecords(selectedDoctorId, 1, newLimit);
      }
    },
    [selectedDoctorId, fetchRecords]
  );

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (selectedDoctorId) {
      // Initial fetch when doctor is selected
      fetchRecords(selectedDoctorId, currentPage, itemsPerPage);
      fetchDocKhataSummary(selectedDoctorId);
    }
  }, [
    selectedDoctorId,
    fetchDocKhataSummary,
    fetchRecords,
    currentPage,
    itemsPerPage,
  ]);

  // When viewType changes, reset to page 1
  useEffect(() => {
    if (selectedDoctorId) {
      fetchRecords(selectedDoctorId, 1, itemsPerPage);
    }
  }, [viewType, selectedDoctorId, itemsPerPage, fetchRecords]);

  return {
    doctors,
    records,
    khataSummary,
    loading,
    fetchRecords,
    fetchDocKhataSummary,
    // Pagination properties and methods
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
  };
}
