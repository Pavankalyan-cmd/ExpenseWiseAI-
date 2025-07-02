# Use official Python image (can also use python:3.11.9-slim if needed)
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1


# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY . /app/


# Expose port
EXPOSE 8000

# Start Gunicorn server
CMD ["gunicorn", "expensetracker.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "1", "--threads", "2"]
