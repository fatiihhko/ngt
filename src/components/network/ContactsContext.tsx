import { createContext, useContext, useMemo, useState, ReactNode, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Contact } from "./types";
import { useNetworkStore } from "@/store/network";

interface ContactsContextValue {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  isLoading: boolean;
  refreshContacts: () => Promise<void>;
}

const ContactsContext = createContext<ContactsContextValue | undefined>(undefined);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { people, loadNetwork } = useNetworkStore();

  const refreshContacts = useCallback(async () => {
    console.log('ContactsContext: refreshContacts called');
    if (isLoading && hasInitialized) return; // Prevent duplicate calls
    
    setIsLoading(true);
    try {
      // First try to load from NetworkStore (for mock data)
      console.log('ContactsContext: Loading from NetworkStore');
      await loadNetwork();
      
      // Then also load from Supabase (for real data)
      console.log('ContactsContext: Loading from Supabase');
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        console.log('ContactsContext: Setting contacts from Supabase:', data.length, 'contacts');
        

        
        setContacts(data as Contact[]);
      } else if (error) {
        console.error('ContactsContext: Supabase error:', error);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [isLoading, hasInitialized, loadNetwork]);

  useEffect(() => {
    if (!hasInitialized) {
      refreshContacts();
    }

    // Listen for contact refresh events
    const handleContactsRefresh = (event: CustomEvent) => {
      console.log('ContactsContext: Received contacts:refresh event', event);
      if (event.detail) {
        setContacts(event.detail);
      } else {
        console.log('ContactsContext: Calling refreshContacts()');
        refreshContacts();
      }
    };

    window.addEventListener('contacts:refresh', handleContactsRefresh as EventListener);
    
    return () => {
      window.removeEventListener('contacts:refresh', handleContactsRefresh as EventListener);
    };
  }, [refreshContacts, hasInitialized]);

  // Update contacts when people change in NetworkStore
  useEffect(() => {
    if (people.length > 0) {
      // Convert Person to Contact format
      const convertedContacts = people.map(person => ({
        id: person.id,
        first_name: person.name.split(' ')[0] || '',
        last_name: person.name.split(' ').slice(1).join(' ') || '',
        profession: person.role || '',
        city: person.city || '',
        current_city: person.currentCity || '',
        birth_city: person.birthCity || '',
        age: person.age || '',
        company: person.company || '',
        education_school: person.education?.school || '',
        education_department: person.education?.department || '',
        education_degree: person.education?.degree || '',
        education_graduation_year: person.education?.graduationYear || '',
        work_experience: person.workExperience || '',
        sectors: person.sectors || [],
        custom_sector: person.customSector || '',
        expertise: person.expertise || [],
        custom_expertise: person.customExpertise || '',
        services: person.services || [],
        custom_service: person.customService || '',
        investments: person.investments || '',
        personal_traits: person.personalTraits || [],
        values: person.values || [],
        goals: person.goals || '',
        vision: person.vision || '',
        interests: person.interests || '',
        custom_interest: person.customInterest || '',
        languages: person.languages || [],
        custom_language: person.customLanguage || '',
        is_mentor: person.isMentor || false,
        volunteer_work: person.volunteerWork || '',
        turning_points: person.turningPoints || '',
        challenges: person.challenges || '',
        lessons: person.lessons || '',
        future_goals: person.futureGoals || '',
        business_ideas: person.businessIdeas || '',
        investment_interest: person.investmentInterest || false,
        collaboration_areas: person.collaborationAreas || '',
        description: person.description || '',
        email: person.email || '',
        phone: person.phone || '',
        category: person.category || 'work',
        relationship_degree: Math.max(1, Math.min(10, person.closeness || 5)),
        created_at: person.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: '',
        avatar_url: person.avatarUrl || '',
        handle: person.handle || '',
        tags: person.tags || [],
        parent_contact_id: person.parent_contact_id || null
      })) as Contact[];
      
      setContacts(convertedContacts);
    }
  }, [people]);

  const value = useMemo(() => ({ 
    contacts, 
    setContacts, 
    isLoading,
    refreshContacts 
  }), [contacts, isLoading, refreshContacts]);

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
};

export const useContacts = () => {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within ContactsProvider");
  return ctx;
};
