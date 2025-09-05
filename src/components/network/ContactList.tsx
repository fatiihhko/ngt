import React, { useEffect, useState, memo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, Sparkles, Filter, Grid, List, Plus, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useContacts } from "./ContactsContext";
import type { Contact } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactListSkeleton } from "@/components/ui/loading-skeleton";
import { ContactCard } from "./ContactCard";
import { motion, AnimatePresence } from "framer-motion";

const ContactList = memo(() => {
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { contacts, setContacts, isLoading, refreshContacts } = useContacts();

  // Initialize filtered contacts when contacts change
  useEffect(() => {
    setFilteredContacts(contacts);
  }, [contacts]);

  // Debounced search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredContacts(contacts);
        return;
      }
      
      const filtered = contacts.filter(contact => 
        contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.services?.some(service => service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        contact.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredContacts(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, contacts]);

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      toast({ title: "Silinemedi", description: error.message, variant: "destructive" });
    } else {
      const updated = contacts.filter((c) => c.id !== id);
      setContacts(updated);
      toast({ title: "Kişi silindi", description: "Kişi ağınızdan kaldırıldı." });
    }
  }, [contacts, setContacts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshContacts();
    setIsRefreshing(false);
  };

  // Simplified degree calculation - just use 1 for now to improve performance
  const getDegreeLevel = useCallback((contact: Contact): number => {
    if (!contact.parent_contact_id) return 1;
    // Simple calculation: if has parent, it's 2nd degree
    return 2;
  }, []);

  if (isLoading) {
    return <ContactListSkeleton />;
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced Header with Animation */}
      <motion.div 
        className="text-center space-y-6"
        initial={{ opacity: 0, y: -30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 0 rgba(59, 130, 246, 0)",
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 0 rgba(59, 130, 246, 0)"
              ]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatDelay: 2,
              ease: "easeInOut"
            }}
            className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20"
          >
            <Users className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.h2 
            className="text-4xl font-bold gradient-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Ağ Listesi
          </motion.h2>
        </div>
        
        <motion.p 
          className="text-muted-foreground text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Ağınızdaki {filteredContacts.length} kişiyi keşfedin ✨
        </motion.p>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: [0, 1, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Enhanced Search and Controls */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200/20">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <motion.div 
              className="relative flex-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Kişi ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 focus:border-blue-400 hover:bg-white/10 transition-all duration-300"
              />
            </motion.div>

            {/* View Mode Toggle */}
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2"
              >
                <Grid className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </motion.div>

            {/* Refresh Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                Yenile
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div 
            className="flex items-center justify-between mt-4 pt-4 border-t border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                <Users className="h-3 w-3 mr-1" />
                {filteredContacts.length} kişi
              </Badge>
              {searchTerm && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  <Search className="h-3 w-3 mr-1" />
                  Arama sonucu
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
            </div>
          </motion.div>
        </Card>
      </motion.div>

      {/* Enhanced Cards Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={viewMode}
          className={viewMode === 'grid' 
            ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr" 
            : "space-y-4"
          }
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <ContactCard
                contact={contact}
                index={index}
                degreeLevel={getDegreeLevel(contact)}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Empty State */}
      <AnimatePresence>
        {filteredContacts.length === 0 && !isLoading && (
          <motion.div 
            className="text-center space-y-6 py-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 3,
                ease: "easeInOut"
              }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center"
            >
              <Users className="h-12 w-12 text-muted-foreground" />
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">
                {searchTerm ? "Arama sonucu bulunamadı" : "Henüz kişi eklenmemiş"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerm 
                  ? "Arama kriterlerinizi değiştirmeyi deneyin veya yeni kişiler ekleyin."
                  : "Ağınıza ilk kişiyi ekleyerek başlayın ve bağlantılarınızı genişletin."
                }
              </p>
            </div>

            {!searchTerm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  İlk Kişiyi Ekle
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export { ContactList };
