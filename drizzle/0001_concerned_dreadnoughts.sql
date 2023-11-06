ALTER TABLE "chats" RENAME COLUMN "created-at" TO "created_at";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "created-at" TO "created_at";--> statement-breakpoint
ALTER TABLE "user_subscriptions" RENAME COLUMN "current_period_end" TO "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_stripe_price_id_unique";--> statement-breakpoint
ALTER TABLE "user_subscriptions" ALTER COLUMN "stripe_customer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ALTER COLUMN "stripe_subscription_id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD COLUMN "stripe_current_period_ended_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id");