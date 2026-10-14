FROM python:3.12-slim
WORKDIR /srv

# install local packages + backend deps
COPY packages /srv/packages
COPY apps/backend /srv/apps/backend
RUN pip install --no-cache-dir -e packages/core -e packages/rules_engine \
 && pip install --no-cache-dir -r apps/backend/requirements.txt

WORKDIR /srv/apps/backend
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
