import { passwordManager, PasswordEntry } from './PasswordManager';

export interface FormField {
  element: HTMLInputElement;
  type: 'username' | 'password' | 'email' | 'other';
  name?: string;
  id?: string;
  placeholder?: string;
}

export interface DetectedForm {
  form: HTMLFormElement;
  fields: FormField[];
  url: string;
  domain: string;
}

class PasswordAutofill {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getDomainFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  }

  private isPasswordField(element: HTMLInputElement): boolean {
    const type = element.type.toLowerCase();
    const name = (element.name || '').toLowerCase();
    const id = (element.id || '').toLowerCase();
    const placeholder = (element.placeholder || '').toLowerCase();
    const autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase();

    return (
      type === 'password' ||
      name.includes('password') ||
      name.includes('pass') ||
      name.includes('pwd') ||
      id.includes('password') ||
      id.includes('pass') ||
      id.includes('pwd') ||
      placeholder.includes('password') ||
      placeholder.includes('pass') ||
      placeholder.includes('pwd') ||
      autocomplete === 'current-password' ||
      autocomplete === 'new-password'
    );
  }

  private isUsernameField(element: HTMLInputElement): boolean {
    const type = element.type.toLowerCase();
    const name = (element.name || '').toLowerCase();
    const id = (element.id || '').toLowerCase();
    const placeholder = (element.placeholder || '').toLowerCase();
    const autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase();

    if (type === 'email') return true;
    if (type === 'text' && (
      name.includes('email') ||
      name.includes('username') ||
      name.includes('user') ||
      name.includes('login') ||
      id.includes('email') ||
      id.includes('username') ||
      id.includes('user') ||
      id.includes('login') ||
      placeholder.includes('email') ||
      placeholder.includes('username') ||
      placeholder.includes('user') ||
      placeholder.includes('login') ||
      autocomplete === 'username' ||
      autocomplete === 'email'
    )) {
      return true;
    }

    return false;
  }

  private detectFieldsInForm(form: HTMLFormElement): FormField[] {
    const inputs = form.querySelectorAll('input');
    const fields: FormField[] = [];

    inputs.forEach((input) => {
      const element = input as HTMLInputElement;
      let type: FormField['type'] = 'other';

      if (this.isPasswordField(element)) {
        type = 'password';
      } else if (this.isUsernameField(element)) {
        type = element.type === 'email' ? 'email' : 'username';
      }

      fields.push({
        element,
        type,
        name: element.name,
        id: element.id,
        placeholder: element.placeholder,
      });
    });

    return fields;
  }

  detectPasswordForms(): DetectedForm[] {
    if (!this.isClient()) return [];

    const forms = document.querySelectorAll('form');
    const detectedForms: DetectedForm[] = [];
    const currentUrl = window.location.href;
    const domain = this.getDomainFromUrl(currentUrl);

    forms.forEach((form) => {
      const fields = this.detectFieldsInForm(form as HTMLFormElement);
      const hasPasswordField = fields.some(field => field.type === 'password');

      if (hasPasswordField) {
        detectedForms.push({
          form: form as HTMLFormElement,
          fields,
          url: currentUrl,
          domain,
        });
      }
    });

    return detectedForms;
  }

  async getPasswordSuggestionsForUrl(url: string): Promise<PasswordEntry[]> {
    try {
      const passwords = await passwordManager.getPasswordsByUrl(url);
      return passwords;
    } catch (error) {
      console.error('Error getting password suggestions:', error);
      return [];
    }
  }

  fillFormFields(form: DetectedForm, passwordEntry: PasswordEntry): void {
    if (!this.isClient()) return;

    const usernameField = form.fields.find(field => 
      field.type === 'username' || field.type === 'email'
    );
    const passwordField = form.fields.find(field => field.type === 'password');

    if (usernameField) {
      usernameField.element.value = passwordEntry.username;
      usernameField.element.dispatchEvent(new Event('input', { bubbles: true }));
      usernameField.element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (passwordField) {
      passwordField.element.value = passwordEntry.password;
      passwordField.element.dispatchEvent(new Event('input', { bubbles: true }));
      passwordField.element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  createPasswordSuggestionDropdown(
    form: DetectedForm,
    passwords: PasswordEntry[],
    onSelect: (password: PasswordEntry) => void
  ): HTMLElement {
    if (!this.isClient()) return document.createElement('div');

    const dropdown = document.createElement('div');
    dropdown.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10000;
      max-height: 200px;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    passwords.forEach((password) => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;

      const leftSide = document.createElement('div');
      leftSide.innerHTML = `
        <div style="font-weight: 500; color: #333;">${password.title}</div>
        <div style="font-size: 12px; color: #666;">${password.username}</div>
      `;

      const rightSide = document.createElement('div');
      rightSide.innerHTML = `
        <div style="font-size: 11px; color: #999; background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">
          ${password.url.replace(/^https?:\/\//, '').split('/')[0]}
        </div>
      `;

      item.appendChild(leftSide);
      item.appendChild(rightSide);

      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f5f5f5';
      });

      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'white';
      });

      item.addEventListener('click', () => {
        onSelect(password);
        dropdown.remove();
      });

      dropdown.appendChild(item);
    });

    return dropdown;
  }

  positionDropdown(dropdown: HTMLElement, targetField: FormField): void {
    if (!this.isClient()) return;

    const rect = targetField.element.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + window.scrollY}px`;
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.width = `${rect.width}px`;
  }

  injectAutofillScript(): void {
    if (!this.isClient()) return;

    const script = document.createElement('script');
    script.textContent = `
      (function() {
        let activeDropdown = null;
        let activeForm = null;
        let currentForm = null;

        function removeDropdown() {
          if (activeDropdown) {
            activeDropdown.remove();
            activeDropdown = null;
          }
        }

        function showPasswordSuggestions(form, field, passwords) {
          removeDropdown();
          
          if (passwords.length === 0) return;

          const dropdown = document.createElement('div');
          dropdown.style.cssText = \`
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            max-height: 200px;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
          \`;

          passwords.forEach((password) => {
            const item = document.createElement('div');
            item.style.cssText = \`
              padding: 8px 12px;
              cursor: pointer;
              border-bottom: 1px solid #eee;
              display: flex;
              justify-content: space-between;
              align-items: center;
            \`;

            const leftSide = document.createElement('div');
            leftSide.innerHTML = \`
              <div style="font-weight: 500; color: #333;">\${password.title}</div>
              <div style="font-size: 12px; color: #666;">\${password.username}</div>
            \`;

            const rightSide = document.createElement('div');
            rightSide.innerHTML = \`
              <div style="font-size: 11px; color: #999; background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">
                \${password.url.replace(/^https?:\\/\\//, '').split('/')[0]}
              </div>
            \`;

            item.appendChild(leftSide);
            item.appendChild(rightSide);

            item.addEventListener('mouseenter', () => {
              item.style.backgroundColor = '#f5f5f5';
            });

            item.addEventListener('mouseleave', () => {
              item.style.backgroundColor = 'white';
            });

            item.addEventListener('click', () => {
              // Fill the form
              const usernameField = form.fields.find(f => f.type === 'username' || f.type === 'email');
              const passwordField = form.fields.find(f => f.type === 'password');

              if (usernameField) {
                usernameField.element.value = password.username;
                usernameField.element.dispatchEvent(new Event('input', { bubbles: true }));
                usernameField.element.dispatchEvent(new Event('change', { bubbles: true }));
              }

              if (passwordField) {
                passwordField.element.value = password.password;
                passwordField.element.dispatchEvent(new Event('input', { bubbles: true }));
                passwordField.element.dispatchEvent(new Event('change', { bubbles: true }));
              }

              removeDropdown();
            });

            dropdown.appendChild(item);
          });

          const rect = field.element.getBoundingClientRect();
          dropdown.style.top = \`\${rect.bottom + window.scrollY}px\`;
          dropdown.style.left = \`\${rect.left + window.scrollX}px\`;
          dropdown.style.width = \`\${rect.width}px\`;

          document.body.appendChild(dropdown);
          activeDropdown = dropdown;
        }

        function handleFieldClick(event) {
          const field = event.target;
          if (field.tagName !== 'INPUT') return;

          // Find the parent form
          let form = field.closest('form');
          if (!form) return;

          // Detect fields in this form
          const inputs = form.querySelectorAll('input');
          const fields = Array.from(inputs).map(input => ({
            element: input,
            type: input.type.toLowerCase(),
            name: input.name,
            id: input.id,
            placeholder: input.placeholder
          }));

          const hasPasswordField = fields.some(f => f.type === 'password');
          if (!hasPasswordField) return;

          const formObj = { form, fields, url: window.location.href, domain: window.location.hostname };
          
          // Request password suggestions from the main process
          window.postMessage({
            type: 'REQUEST_PASSWORD_SUGGESTIONS',
            data: { url: window.location.href, form: formObj }
          }, '*');
        }

        // Remove dropdown when clicking outside
        document.addEventListener('click', (event) => {
          if (activeDropdown && !activeDropdown.contains(event.target)) {
            removeDropdown();
          }
        });

        // Add click listeners to all input fields
        document.addEventListener('click', handleFieldClick);

        // Listen for password suggestions from main process
        window.addEventListener('message', (event) => {
          if (event.data.type === 'PASSWORD_SUGGESTIONS_RESPONSE') {
            const { passwords, form } = event.data;
            if (passwords && passwords.length > 0) {
              showPasswordSuggestions(form, form.fields.find(f => f.type === 'password'), passwords);
            }
          }
        });
      })();
    `;

    document.head.appendChild(script);
  }

  async initializeAutofill(): Promise<void> {
    if (!this.isClient()) return;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.injectAutofillScript();
      });
    } else {
      this.injectAutofillScript();
    }

    // Listen for password suggestion requests
    window.addEventListener('message', async (event) => {
      if (event.data.type === 'REQUEST_PASSWORD_SUGGESTIONS') {
        const { url } = event.data.data;
        const passwords = await this.getPasswordSuggestionsForUrl(url);
        
        window.postMessage({
          type: 'PASSWORD_SUGGESTIONS_RESPONSE',
          data: { passwords, form: event.data.data.form }
        }, '*');
      }
    });
  }

  detectNewPassword(): { username: string; password: string; url: string } | null {
    if (!this.isClient()) return null;

    const forms = this.detectPasswordForms();
    if (forms.length === 0) return null;

    const form = forms[0];
    const usernameField = form.fields.find(field => 
      field.type === 'username' || field.type === 'email'
    );
    const passwordField = form.fields.find(field => field.type === 'password');

    if (usernameField && passwordField && 
        usernameField.element.value && passwordField.element.value) {
      return {
        username: usernameField.element.value,
        password: passwordField.element.value,
        url: form.url,
      };
    }

    return null;
  }
}

export const passwordAutofill = new PasswordAutofill();
