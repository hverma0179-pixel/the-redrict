import mongoose from 'mongoose';

const DomainInfoSchema = new mongoose.Schema(
  {
    hostname: String,
    protocol: String,
    port: String,
    registrableDomain: String,
    subdomain: String,
    publicSuffix: String,
    isIpAddress: Boolean,
    provider: String
  },
  { _id: false }
);

const RedirectStepSchema = new mongoose.Schema(
  {
    hop: Number,
    url: String,
    statusCode: Number,
    statusText: String,
    redirectTo: String,
    durationMs: Number,
    domain: DomainInfoSchema
  },
  { _id: false }
);

const SearchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    originalUrl: {
      type: String,
      required: true
    },
    finalUrl: {
      type: String,
      required: true
    },
    finalStatusCode: Number,
    redirectCount: Number,
    responseTimeMs: Number,
    provider: String,
    chain: [RedirectStepSchema],
    domainInfo: {
      original: DomainInfoSchema,
      final: DomainInfoSchema,
      sameRegistrableDomain: Boolean,
      detectedProvider: String
    }
  },
  { timestamps: true }
);

SearchHistorySchema.index({ user: 1, createdAt: -1 });

export const SearchHistory = mongoose.model('SearchHistory', SearchHistorySchema);
