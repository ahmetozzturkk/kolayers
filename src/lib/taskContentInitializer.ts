import { tasks } from './mockData';

/**
 * Initialize task content in localStorage and sessionStorage
 * This ensures content is available for tasks like Annual Leave Policies
 */
export function initializeTaskContent() {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('Initializing task content in storage...');
    
    // Find task2 (Annual Leave Policies)
    const task2 = tasks.find(t => t.id === 'task2');
    
    if (task2 && task2.content) {
      // Store in sessionStorage
      const task2Content = {
        title: task2.title,
        taskType: 'reading',
        readingTime: 40,
        isReading: true,
        sections: task2.content.sections || []
      };
      
      console.log('Storing Annual Leave Policies content in sessionStorage:', task2Content);
      sessionStorage.setItem(`task_content_${task2.id}`, JSON.stringify(task2Content));
      
      // Also store in localStorage for persistence
      localStorage.setItem('annual_leave_policies_content', JSON.stringify(task2Content));
    } else {
      console.warn('Task2 or its content not found');
    }
    
    // Initialize content for all tasks
    tasks.forEach(task => {
      if (task.content && task.id !== 'task2') {
        console.log(`Storing content for task ${task.id} in sessionStorage`);
        sessionStorage.setItem(`task_content_${task.id}`, JSON.stringify(task.content));
      } else if (task.taskType === 'application' || task.taskType === 'video' || task.taskType === 'referral') {
        // Generate appropriate content based on task type
        let taskContent: any = {
          title: task.title,
          taskType: task.taskType,
          readingTime: 0,
          sections: [
            {
              heading: task.title,
              content: task.description || `Content for ${task.title}`
            }
          ]
        };
        
        // Special properties based on task type
        if (task.taskType === 'application') {
          taskContent.isApplication = true;
          taskContent.externalUrl = task.externalUrl;
        } else if (task.taskType === 'video') {
          taskContent.isVideo = true;
          taskContent.readingTime = 30;
          taskContent.videoUrl = task.externalUrl || "https://www.youtube.com/embed/HX9oQ3eozFo?si=uwysTtqo6OX9zxTJ&enablejsapi=1";
        } else if (task.taskType === 'referral') {
          taskContent.isReferral = true;
          taskContent.sections = [{
            heading: "Referral Program",
            content: `
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 my-4">
              <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 class="text-xl font-bold text-gray-900">Recommend a Colleague</h2>
                <p class="text-gray-600 mt-2">${task.description || 'Help your colleagues improve their skills'}</p>
              </div>
              
              <form id="referral-form-${task.id}" class="space-y-4">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div class="relative">
                    <label for="first-name" class="block text-sm font-medium text-gray-700 mb-1">First name <span class="text-red-500">*</span></label>
                    <input type="text" id="first-name" required class="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-gray-700 bg-white shadow-sm text-sm" />
                  </div>
                  <div class="relative">
                    <label for="last-name" class="block text-sm font-medium text-gray-700 mb-1">Last name <span class="text-red-500">*</span></label>
                    <input type="text" id="last-name" required class="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-gray-700 bg-white shadow-sm text-sm" />
                  </div>
                </div>
                
                <div class="relative">
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Work email <span class="text-red-500">*</span></label>
                  <input type="email" id="email" required class="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-gray-700 bg-white shadow-sm text-sm" />
                </div>
                
                <div class="relative">
                  <label for="department" class="block text-sm font-medium text-gray-700 mb-1">Department <span class="text-red-500">*</span></label>
                  <select id="department" required class="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-gray-700 bg-white shadow-sm appearance-none pr-8 text-sm">
                    <option value="">Select department</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Other">Other</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-5">
                    <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div class="relative">
                  <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Personal message (optional)</label>
                  <textarea id="message" rows="2" class="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 text-gray-700 bg-white shadow-sm text-sm"></textarea>
                </div>
                
                <div class="pt-2">
                  <button 
                    type="button" 
                    id="send-invitation-btn-${task.id}"
                    class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    onclick="
                      const form = document.getElementById('referral-form-${task.id}');
                      if (form.checkValidity()) {
                        document.getElementById('referral-success-${task.id}').classList.remove('hidden');
                        const button = document.getElementById('send-invitation-btn-${task.id}');
                        button.disabled = true;
                        button.classList.add('opacity-75');
                        button.classList.remove('hover:from-indigo-500', 'hover:to-indigo-600');
                        
                        // Call the React function to enable Mark as Complete button
                        window.handleReferralSubmit();
                        
                        // Manually trigger task completion after delay
                        setTimeout(() => {
                          if (typeof window.markTaskAsComplete === 'function') {
                            window.markTaskAsComplete('${task.id}');
                          }
                        }, 1500);
                      } else {
                        form.reportValidity();
                      }
                    "
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Send Invitation
                  </button>
                  <p class="text-xs text-gray-500 text-center mt-2">Invite colleagues to earn rewards</p>
                </div>
              </form>
              
              <div id="referral-success-${task.id}" class="hidden mt-4 bg-green-50 border border-green-200 rounded-md p-3 animate-fade-in">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-green-800">Invitation sent successfully!</h3>
                    <div class="mt-1 text-xs text-green-700">
                      <p>Your colleague will receive an email invitation shortly. Thank you for helping to improve our team's skills!</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <style>
                .animate-fade-in {
                  animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              </style>
            </div>
            `
          }];
        }
        
        console.log(`Creating default content for ${task.taskType} task ${task.id}:`, taskContent);
        sessionStorage.setItem(`task_content_${task.id}`, JSON.stringify(taskContent));
      }
    });
    
    console.log('Task content initialization complete');
  } catch (e) {
    console.error('Error initializing task content:', e);
  }
} 