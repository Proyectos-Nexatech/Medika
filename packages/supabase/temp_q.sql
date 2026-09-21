CREATE POLICY "Auth users can access documents" ON storage.objects FOR ALL USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
