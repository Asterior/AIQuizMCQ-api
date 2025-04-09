class Solution:
    def jobSequencing(self, jobs, n):
        # Sort jobs based on profit in decreasing order
        jobs.sort(key=lambda x: x[1], reverse=True)
        
        # Find maximum deadline
        max_deadline = 0
        for job in jobs:
            max_deadline = max(max_deadline, job[0])
        
        # Initialize slot and result
        slots = set()
        count = 0
        total_profit = 0
        
        # Process jobs
        for deadline, profit in jobs:
            if deadline <= 0 or profit <= 0:
                continue
                
            # Find the latest available slot
            current_slot = deadline
            while current_slot > 0 and current_slot in slots:
                current_slot -= 1
                
            if current_slot > 0:
                slots.add(current_slot)
                count += 1
                total_profit += profit
        
        return [count, total_profit]