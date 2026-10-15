import { CourseSuggestion } from '../types';

export const COURSE_CATALOG: Record<string, CourseSuggestion> = {
  'React': {
    title: 'Advanced React Patterns & Performance Optimization',
    provider: 'Frontend Masters',
    duration: '18 hours',
    level: 'Advanced',
  },
  'TypeScript': {
    title: 'Enterprise TypeScript: Deep Dive & Strict Typing',
    provider: 'Coursera / Google Cloud',
    duration: '22 hours',
    level: 'Advanced',
  },
  'Node.js': {
    title: 'High-Throughput Node.js Microservices Architecture',
    provider: 'Linux Foundation',
    duration: '25 hours',
    level: 'Intermediate - Advanced',
  },
  'Python': {
    title: 'Python for Scalable Systems & High-Performance Computing',
    provider: 'DeepLearning.AI',
    duration: '30 hours',
    level: 'Advanced',
  },
  'Go': {
    title: 'Cloud-Native Go: Concurrency & Distributed Systems',
    provider: 'O\'Reilly Learning',
    duration: '20 hours',
    level: 'Advanced',
  },
  'Docker': {
    title: 'Containerization Best Practices & Multi-Stage Builds',
    provider: 'Docker Captains Academy',
    duration: '14 hours',
    level: 'Intermediate',
  },
  'Kubernetes': {
    title: 'Certified Kubernetes Administrator (CKA) Production Track',
    provider: 'Cloud Native Computing Foundation (CNCF)',
    duration: '35 hours',
    level: 'Advanced',
  },
  'AWS': {
    title: 'AWS Certified Solutions Architect: Cloud Resiliency & Scale',
    provider: 'AWS Training & Certification',
    duration: '40 hours',
    level: 'Advanced',
  },
  'PostgreSQL': {
    title: 'PostgreSQL Internals, Index Tuning & High Availability',
    provider: 'PostgreSQL Professional Guild',
    duration: '24 hours',
    level: 'Advanced',
  },
  'UI/UX Design': {
    title: 'Design Systems Architecture & Micro-Interactions in Figma',
    provider: 'Interaction Design Foundation',
    duration: '16 hours',
    level: 'Intermediate - Advanced',
  },
  'Data Engineering': {
    title: 'Modern Streaming Data Pipelines (Kafka, Spark, dbt)',
    provider: 'DataCamp / Databricks',
    duration: '32 hours',
    level: 'Advanced',
  },
  'Machine Learning': {
    title: 'Production ML: MLOps, Model Serving & Feature Stores',
    provider: 'Stanford Online / Coursera',
    duration: '38 hours',
    level: 'Advanced',
  },
  'GraphQL': {
    title: 'Production GraphQL APIs: Federation & Schema Governance',
    provider: 'Apollo GraphQL Odyssey',
    duration: '15 hours',
    level: 'Intermediate',
  },
};

export const ALL_SKILLS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Go',
  'Docker',
  'Kubernetes',
  'AWS',
  'PostgreSQL',
  'UI/UX Design',
  'Data Engineering',
  'Machine Learning',
  'GraphQL',
];
