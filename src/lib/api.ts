import { supabase } from './supabase';

/**
 * API utility functions for interacting with Supabase
 */

// Example function to fetch data from a table
export async function fetchData(tableName: string, options?: { 
  limit?: number, 
  orderBy?: { column: string, ascending?: boolean },
  filters?: Array<{ column: string, operator: string, value: any }>
}) {
  let query = supabase
    .from(tableName)
    .select('*');
  
  // Apply filters if provided
  if (options?.filters) {
    options.filters.forEach(filter => {
      query = query.filter(filter.column, filter.operator, filter.value);
    });
  }
  
  // Apply ordering if provided
  if (options?.orderBy) {
    query = query.order(options.orderBy.column, { 
      ascending: options.orderBy.ascending ?? true 
    });
  }
  
  // Apply limit if provided
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
  
  return data;
}

// Example function to insert data into a table
export async function insertData(tableName: string, data: any) {
  const { data: result, error } = await supabase
    .from(tableName)
    .insert(data)
    .select();
  
  if (error) {
    console.error('Error inserting data:', error);
    throw error;
  }
  
  return result;
}

// Example function to update data in a table
export async function updateData(tableName: string, id: number | string, data: any) {
  const { data: result, error } = await supabase
    .from(tableName)
    .update(data)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating data:', error);
    throw error;
  }
  
  return result;
}

// Example function to delete data from a table
export async function deleteData(tableName: string, id: number | string) {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
  
  return true;
}

// Example function for authentication
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }
  
  return data;
}

// Example function to sign up a new user
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }
  
  return data;
}

// Example function to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
  
  return true;
}

// Example function to get the current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
