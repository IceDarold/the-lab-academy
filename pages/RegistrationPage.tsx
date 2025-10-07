                     <Input
                         id="email-address"
                         label="Email address"
                         type="email"
                         autoComplete="email"
                         placeholder="you@example.com"
                         {...register('email')}
                         // FIX: Cast message to string to resolve TypeScript type mismatch from react-hook-form.
                         error={errors.email?.message as string || emailExistsError}
                         disabled={isSubmitting}
                     />